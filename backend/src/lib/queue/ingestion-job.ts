export type IngestionSourceType = "PDF" | "URL";

export interface IngestionJobData {
  sourceId: string;
  type: IngestionSourceType;
  filePath?: string;
  url?: string;
}

export const INGESTION_JOB_NAME = "process-source";
export const INGESTION_QUEUE_NAME = "ingestionQueue";
