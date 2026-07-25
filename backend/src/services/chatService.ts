import type { Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";
import { getOpenRouterConfig } from "../config/open-router.js";
import type { RagDebugMetadata } from "../types/rag-debug.js";

function formatContext(contextChunks: string[]) {
  if (contextChunks.length === 0) {
    return "No context chunks were retrieved.";
  }

  return contextChunks
    .map((content, index) => `[Context ${index + 1}]\n${content}`)
    .join("\n\n---\n\n");
}

export async function streamChatResponse(
  originalQuestion: string,
  contextChunks: string[],
  response: Response,
  debugMetadata?: RagDebugMetadata,
) {
  const model = new ChatOpenAI({
    ...getOpenRouterConfig(),
    model: env.openRouterChatModel,
    temperature: 0,
    streaming: true,
  });
  const context = formatContext(contextChunks);
  const systemPrompt = `Answer the user's question strictly from the supplied
context. Do not use outside knowledge. If the context does not contain enough
information, clearly say that the provided sources do not contain the answer.

Context:
${context}`;

  response.status(200);
  response.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders();

  if (env.ragDebug && debugMetadata) {
    response.write(
      `event: debug\ndata: ${JSON.stringify(debugMetadata)}\n\n`,
    );
  }

  const abortController = new AbortController();
  const abortOnClose = () => abortController.abort();
  response.once("close", abortOnClose);

  try {
    const stream = await model.stream(
      [
        ["system", systemPrompt],
        ["human", originalQuestion],
      ],
      { signal: abortController.signal },
    );

    for await (const chunk of stream) {
      if (response.destroyed || response.writableEnded) {
        break;
      }

      const text = chunk.text;
      if (text) {
        response.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    if (!response.destroyed && !response.writableEnded) {
      response.write(`event: done\ndata: {}\n\n`);
      response.end();
    }
  } finally {
    response.off("close", abortOnClose);
  }
}
