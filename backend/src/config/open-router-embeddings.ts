import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "./env.js";
import { getOpenRouterConfig } from "./open-router.js";

export const EMBEDDING_DIMENSIONS = 1_536;

let embeddingsClient: OpenAIEmbeddings | undefined;

export function getOpenRouterEmbeddings() {
  embeddingsClient ??= new OpenAIEmbeddings({
    ...getOpenRouterConfig(),
    model: env.openRouterEmbeddingModel,
    dimensions: EMBEDDING_DIMENSIONS,
    batchSize: 100,
    maxRetries: 3,
  });

  return embeddingsClient;
}
