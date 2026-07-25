import { env } from "./env.js";

export function getOpenRouterConfig() {
  if (!env.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  return {
    apiKey: env.openRouterApiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  };
}
