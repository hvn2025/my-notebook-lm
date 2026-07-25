import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { streamChatResponse } from "../services/chatService.js";
import { logRagDebug } from "../services/ragDebugService.js";
import { retrieveRelevantChunks } from "../services/retrievalService.js";
import { generateStepBackQuestion } from "../services/stepBackService.js";
import type { RagDebugMetadata } from "../types/rag-debug.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

  if (!message) {
    response.status(400).json({ error: "Message is required" });
    return;
  }

  if (!uuidPattern.test(notebookId)) {
    response.status(400).json({ error: "A valid notebookId is required" });
    return;
  }

  try {
    const traceId = randomUUID();
    const stepBackQuestion = await generateStepBackQuestion(message);
    const retrieval = await retrieveRelevantChunks(
      message,
      stepBackQuestion,
      notebookId,
    );
    const debugMetadata: RagDebugMetadata | undefined = env.ragDebug
      ? {
          traceId,
          notebookId,
          originalQuestion: message,
          stepBackQuestion,
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
