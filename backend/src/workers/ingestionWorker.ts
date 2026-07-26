import { Worker, type Job } from "bullmq";
import {
  INGESTION_QUEUE_NAME,
  type IngestionJobData,
} from "../lib/queue/index.js";
import { createRedisConnection } from "../lib/queue/redis.js";
import {
  processSourceDocument,
  type IngestionResult,
} from "../services/ingestionService.js";
import { materializeStoredPdf } from "../services/ingestion/stored-pdf.js";
import { prisma } from "../config/db.js";
import { removeUploadedFile } from "../utils/uploaded-file.js";

const workerConnection = createRedisConnection(null);

function isFinalAttempt(job: Job<IngestionJobData>) {
  const maximumAttempts = job.opts.attempts ?? 1;
  return job.attemptsMade + 1 >= maximumAttempts;
}

async function cleanupTemporaryPdf(jobData: IngestionJobData) {
  if (jobData.type === "PDF" && jobData.filePath) {
    await removeUploadedFile(jobData.filePath);
  }
}

async function sourceExists(sourceId: string) {
  const count = await prisma.source.count({ where: { id: sourceId } });
  return count > 0;
}

export const ingestionWorker = new Worker<
  IngestionJobData,
  IngestionResult
>(
  INGESTION_QUEUE_NAME,
  async (job) => {
    let runtimeData = job.data;
    let completed = false;
    try {
      runtimeData = await materializeStoredPdf(job.data);
      const result = await processSourceDocument(runtimeData);
      completed = true;
      return result;
    } catch (error) {
      if (!(await sourceExists(job.data.sourceId))) {
        completed = true;
        return { sourceId: job.data.sourceId, chunkCount: 0, cancelled: true };
      }
      throw error;
    } finally {
      const isStoredPdf = Boolean(job.data.storagePath);
      if (isStoredPdf || completed || isFinalAttempt(job)) {
        await cleanupTemporaryPdf(runtimeData);
      }
    }
  },
  {
    connection: workerConnection,
    concurrency: 2,
  },
);

ingestionWorker.on("completed", (job, result) => {
  if (result.cancelled) {
    console.log(`Ingestion job ${job.id} cancelled because its source was deleted`);
    return;
  }
  console.log(
    `Ingestion job ${job.id} completed with ${result.chunkCount} chunks`,
  );
});

ingestionWorker.on("failed", (job, error) => {
  const jobId = job?.id ?? "unknown";
  const attempt = job?.attemptsMade ?? "unknown";
  console.error(`Ingestion job ${jobId} failed after attempt ${attempt}:`, error);
});

ingestionWorker.on("error", (error) => {
  console.error("Ingestion worker error:", error);
});

export async function closeIngestionWorker() {
  await ingestionWorker.close();

  if (workerConnection.status !== "end") {
    await workerConnection.quit();
  }
}
