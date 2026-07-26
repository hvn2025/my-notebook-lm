import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { streamChatResponse } from "../services/chatService.js";
import { logRagDebug } from "../services/ragDebugService.js";
import { retrieveRelevantChunks } from "../services/retrievalService.js";
import { generateStepBackQuestion } from "../services/stepBackService.js";
import type { RagDebugMetadata } from "../types/rag-debug.js";
import { getAuthIdentity } from "../middleware/auth.middleware.js";
import { requireOwnedChatSelection } from "../services/ownership.service.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readSourceIds(value: unknown) {
  if (value === undefined) {
    return { valid: true, sourceIds: undefined };
  }

  if (!Array.isArray(value)) {
    return { valid: false, sourceIds: undefined };
  }

  const sourceIds = [...new Set(value.map(readString))];
  return {
    valid: sourceIds.every((sourceId) => uuidPattern.test(sourceId)),
    sourceIds,
  };
}

function sendStreamError(response: Response) {
  if (response.destroyed || response.writableEnded) {
    return;
  }

  response.write(
    `event: error\ndata: ${JSON.stringify({ error: "Unable to complete chat response" })}\n\n`,
  );
  response.end();
}

export async function postChat(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const message = readString(request.body?.message);
  const notebookId = readString(request.body?.notebookId);
  const selection = readSourceIds(request.body?.sourceIds);

  if (!message) {
    response.status(400).json({ error: "Message is required" });
    return;
  }

  if (!uuidPattern.test(notebookId)) {
    response.status(400).json({ error: "A valid notebookId is required" });
    return;
  }

  if (!selection.valid) {
    response.status(400).json({ error: "sourceIds must contain valid ids" });
    return;
  }

  try {
    await requireOwnedChatSelection(
      getAuthIdentity(request),
      notebookId,
      selection.sourceIds,
    );
    const traceId = randomUUID();
    const stepBackQuestion = await generateStepBackQuestion(message);
    const retrieval = await retrieveRelevantChunks(
      message,
      stepBackQuestion,
      notebookId,
      selection.sourceIds,
    );
    const debugMetadata: RagDebugMetadata | undefined = env.ragDebug
      ? {
          traceId,
          notebookId,
          originalQuestion: message,
          stepBackQuestion,
          selectedSourceIds: selection.sourceIds,
          chatModel: env.openRouterChatModel,
          embeddingModel: env.openRouterEmbeddingModel,
          retrieval: retrieval.debug,
          contextPreviews: retrieval.contextChunks.map((content) =>
            content.replace(/\s+/g, " ").slice(0, 160),
          ),
        }
      : undefined;

    if (debugMetadata) {
      logRagDebug(debugMetadata);
    }

    await streamChatResponse(
      message,
      retrieval.contextChunks,
      response,
      debugMetadata,
    );
  } catch (error) {
    if (response.headersSent) {
      sendStreamError(response);
      return;
    }

    next(error);
  }
}
