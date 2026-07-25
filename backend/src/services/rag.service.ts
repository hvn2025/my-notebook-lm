import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getOpenRouterEmbeddings } from "../config/open-router-embeddings.js";
import { getOpenRouterConfig } from "../config/open-router.js";
import { apolloSource } from "../data/apollo-source.js";
import { env } from "../config/env.js";

export async function answerFromMemory(question: string) {
  const openRouterConfig = getOpenRouterConfig();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 75,
  });
  const documents = await splitter.createDocuments([apolloSource]);

  const embeddings = getOpenRouterEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings,
  );
  const relevantDocuments = await vectorStore
    .asRetriever({ k: 3 })
    .invoke(question);
  const context = relevantDocuments
    .map((document) => document.pageContent)
    .join("\n\n---\n\n");

  const llm = new ChatOpenAI({
    model: env.openRouterChatModel,
    ...openRouterConfig,
  });
  const completion = await llm.invoke([
    [
      "system",
      "Answer using only the supplied context. If the context does not contain the answer, say that you do not know.",
    ],
    ["human", `Context:\n${context}\n\nQuestion:\n${question}`],
  ]);

  return completion.text.trim();
}
