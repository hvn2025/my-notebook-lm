import type { DocumentInterface } from "@langchain/core/documents";
import { getOpenRouterEmbeddings } from "../../config/open-router-embeddings.js";

export function generateChunkEmbeddings(chunks: DocumentInterface[]) {
  const contents = chunks.map((chunk) => chunk.pageContent);
  return getOpenRouterEmbeddings().embedDocuments(contents);
}
