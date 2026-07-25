import { Queue } from "bullmq";
import {
  INGESTION_JOB_NAME,
  INGESTION_QUEUE_NAME,
  type IngestionJobData,
} from "./ingestion-job.js";
import { redisConnection } from "./redis.js";

export const ingestionQueue = new Queue<IngestionJobData>(
  INGESTION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    },
  },
);

export function enqueueIngestionJob(data: IngestionJobData) {
  return ingestionQueue.add(INGESTION_JOB_NAME, data, {
    jobId: data.sourceId,
  });
}

export async function closeIngestionQueue() {
  await ingestionQueue.close();

  if (redisConnection.status !== "end") {
    await redisConnection.quit();
  }
}
