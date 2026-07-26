import type { IngestionJobData } from "../../lib/queue/index.js";
import { downloadPdf } from "../source-storage.service.js";

export async function materializeStoredPdf(jobData: IngestionJobData) {
  if (jobData.type !== "PDF" || jobData.filePath) return jobData;
  if (!jobData.storagePath) {
    throw new Error("PDF ingestion job is missing storagePath");
  }

  const filePath = await downloadPdf(jobData.storagePath);
  return { ...jobData, filePath };
}
