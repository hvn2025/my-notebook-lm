import "dotenv/config";

const configuredPort = Number(process.env.PORT ?? 4000);

export const env = {
  port: Number.isInteger(configuredPort) ? configuredPort : 4000,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  redisUrl: process.env.REDIS_URL,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterChatModel:
    process.env.OPENROUTER_CHAT_MODEL ?? "openai/gpt-4o-mini",
  openRouterEmbeddingModel:
    process.env.OPENROUTER_EMBEDDING_MODEL ??
    "openai/text-embedding-3-small",
  ragDebug: process.env.RAG_DEBUG?.toLowerCase() === "true",
};
