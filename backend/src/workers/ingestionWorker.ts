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

export const ingestionWorker = new Worker<
  IngestionJobData,
  IngestionResult
>(
  INGESTION_QUEUE_NAME,
  async (job) => {
    try {
      const result = await processSourceDocument(job.data);
      await cleanupTemporaryPdf(job.data);
      return result;
    } catch (error) {
      if (isFinalAttempt(job)) {
        await cleanupTemporaryPdf(job.data);
      }
      throw error;
    }
  },
  {
    connection: workerConnection,
    concurrency: 2,
  },
);

ingestionWorker.on("completed", (job, result) => {
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
