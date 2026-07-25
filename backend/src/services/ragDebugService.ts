import { env } from "../config/env.js";
import type { RagDebugMetadata } from "../types/rag-debug.js";

export function logRagDebug(metadata: RagDebugMetadata) {
  if (!env.ragDebug) {
    return;
  }

  console.info(
    `[RAG DEBUG ${metadata.traceId}]\n${JSON.stringify(metadata, null, 2)}`,
  );
}
