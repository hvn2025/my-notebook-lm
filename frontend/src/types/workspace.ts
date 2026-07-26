export type SourceStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type SourceType = "PDF" | "URL" | "YOUTUBE";

export interface SourceRecord {
  id: string;
  title: string;
  url: string | null;
  type: SourceType;
  status: SourceStatus;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SourceStatusResponse {
  sourceId: string;
  status: SourceStatus;
  type: SourceType;
  updatedAt: string;
}

export interface RagDebugData {
  traceId: string;
  stepBackQuestion: string;
  selectedSourceIds?: string[];
  retrieval: { uniqueChunkCount: number };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  debug?: RagDebugData;
  error?: boolean;
}
