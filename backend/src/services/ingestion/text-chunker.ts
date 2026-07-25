import type { DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1_000,
  chunkOverlap: 200,
});

export async function splitSourceDocuments(
  documents: DocumentInterface[],
) {
  const chunks = await textSplitter.splitDocuments(documents);
  return chunks.filter((chunk) => chunk.pageContent.trim().length > 0);
}
