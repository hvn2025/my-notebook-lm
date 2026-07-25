export interface RetrievalMatchDebug {
  chunkId: string;
  similarity: number;
}

export interface RetrievalSearchDebug {
  durationMs: number;
  matches: RetrievalMatchDebug[];
}

export interface RetrievalDebug {
  original: RetrievalSearchDebug;
  stepBack: RetrievalSearchDebug;
  uniqueChunkCount: number;
}

export interface RagDebugMetadata {
  traceId: string;
  notebookId: string;
  originalQuestion: string;
  stepBackQuestion: string;
  chatModel: string;
  embeddingModel: string;
  retrieval: RetrievalDebug;
  contextPreviews: string[];
}
