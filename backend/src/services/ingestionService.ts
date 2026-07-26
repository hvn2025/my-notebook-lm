import { SourceStatus } from "@prisma/client";
import { prisma } from "../config/db.js";
import type { IngestionJobData } from "../lib/queue/index.js";
import { replaceDocumentChunks } from "./ingestion/chunk-repository.js";
import { loadSourceDocuments } from "./ingestion/document-loader.js";
import { generateChunkEmbeddings } from "./ingestion/embedding-generator.js";
import { splitSourceDocuments } from "./ingestion/text-chunker.js";
import { generateNotebookTitleForSource } from "./notebook-title.service.js";

export interface IngestionResult {
  sourceId: string;
  chunkCount: number;
  cancelled?: boolean;
}

async function sourceExists(sourceId: string) {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: { id: true },
  });
  return Boolean(source);
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
    const started = await prisma.source.updateMany({
      where: { id: jobData.sourceId },
      data: { status: SourceStatus.PROCESSING },
    });
    if (started.count === 0) {
      return { sourceId: jobData.sourceId, chunkCount: 0, cancelled: true };
    }

    const documents = await loadSourceDocuments(jobData);
    const chunks = await splitSourceDocuments(documents);

    if (chunks.length === 0) {
      throw new Error("The source did not produce any text chunks");
    }

    const embeddings = await generateChunkEmbeddings(chunks);
    await replaceDocumentChunks(jobData.sourceId, chunks, embeddings);
    await generateNotebookTitleForSource(jobData.sourceId).catch(
      (error: unknown) => {
        console.error(
          `Unable to generate a title for source ${jobData.sourceId}:`,
          error,
        );
      },
    );

    const completed = await prisma.source.updateMany({
      where: { id: jobData.sourceId },
      data: { status: SourceStatus.COMPLETED },
    });

    if (completed.count === 0) {
      return { sourceId: jobData.sourceId, chunkCount: 0, cancelled: true };
    }

    return { sourceId: jobData.sourceId, chunkCount: chunks.length };
  } catch (error) {
    if (!(await sourceExists(jobData.sourceId))) {
      return { sourceId: jobData.sourceId, chunkCount: 0, cancelled: true };
    }
    await markSourceFailed(jobData.sourceId);
    throw error;
  }
}
