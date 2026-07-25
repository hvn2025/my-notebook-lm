import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";
import { getOpenRouterConfig } from "../config/open-router.js";

const systemPrompt = `You are an expert at world knowledge and question abstraction.
Rewrite the user's question as one broader, higher-level question that captures
the underlying concept or principle. Return only the rewritten question. Do not
answer either question and do not add commentary.`;

export async function generateStepBackQuestion(originalQuestion: string) {
  const model = new ChatOpenAI({
    ...getOpenRouterConfig(),
    model: env.openRouterChatModel,
    temperature: 0,
  });

  const response = await model.invoke([
    ["system", systemPrompt],
    ["human", originalQuestion],
  ]);
  const stepBackQuestion = response.text.trim();

  if (!stepBackQuestion) {
    throw new Error("The model did not generate a step-back question");
  }

  return stepBackQuestion;
}
