import { SourceStatus } from "@prisma/client";
import { prisma } from "../config/db.js";
import type { IngestionJobData } from "../lib/queue/index.js";
import { replaceDocumentChunks } from "./ingestion/chunk-repository.js";
import { loadSourceDocuments } from "./ingestion/document-loader.js";
import { generateChunkEmbeddings } from "./ingestion/embedding-generator.js";
import { splitSourceDocuments } from "./ingestion/text-chunker.js";

export interface IngestionResult {
  sourceId: string;
  chunkCount: number;
}

async function markSourceFailed(sourceId: string) {
  await prisma.source
    .updateMany({
      where: { id: sourceId },
      data: { status: SourceStatus.FAILED },
    })
    .catch((error: unknown) => {
      console.error(`Unable to mark source ${sourceId} as failed:`, error);
    });
}

export async function processSourceDocument(
  jobData: IngestionJobData,
): Promise<IngestionResult> {
  try {
    await prisma.source.update({
      where: { id: jobData.sourceId },
      data: { status: SourceStatus.PROCESSING },
    });

    const documents = await loadSourceDocuments(jobData);
    const chunks = await splitSourceDocuments(documents);

    if (chunks.length === 0) {
      throw new Error("The source did not produce any text chunks");
    }

    const embeddings = await generateChunkEmbeddings(chunks);
    await replaceDocumentChunks(jobData.sourceId, chunks, embeddings);

    await prisma.source.update({
      where: { id: jobData.sourceId },
      data: { status: SourceStatus.COMPLETED },
    });

    return { sourceId: jobData.sourceId, chunkCount: chunks.length };
  } catch (error) {
    await markSourceFailed(jobData.sourceId);
    throw error;
  }
}
