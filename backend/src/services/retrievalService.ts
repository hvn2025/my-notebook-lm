import { prisma } from "../config/db.js";
import {
  EMBEDDING_DIMENSIONS,
  getOpenRouterEmbeddings,
} from "../config/open-router-embeddings.js";
import type { RetrievalSearchDebug } from "../types/rag-debug.js";
import { toPgVectorLiteral } from "../utils/pg-vector.js";

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

async function searchNotebookChunks(
  notebookId: string,
  embedding: number[],
) {
  const vector = toPgVectorLiteral(embedding, EMBEDDING_DIMENSIONS);

  const startedAt = performance.now();
  const chunks = await prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      chunk."id",
      chunk."content",
      (1 - (chunk."embedding" <=> ${vector}::vector(1536)))::double precision
        AS "similarity"
    FROM "DocumentChunk" AS chunk
    INNER JOIN "Source" AS source
      ON source."id" = chunk."sourceId"
    WHERE source."notebookId" = ${notebookId}::uuid
      AND source."status" = 'COMPLETED'
      AND chunk."embedding" IS NOT NULL
    ORDER BY chunk."embedding" <=> ${vector}::vector(1536)
    LIMIT 5
  `;

  return {
    chunks,
    debug: {
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      matches: chunks.map((chunk) => ({
        chunkId: chunk.id,
        similarity: Number(chunk.similarity.toFixed(4)),
      })),
    } satisfies RetrievalSearchDebug,
  };
}

export async function retrieveRelevantChunks(
  originalQuestion: string,
  stepBackQuestion: string,
  notebookId: string,
) {
  const embeddings = getOpenRouterEmbeddings();
  const [originalEmbedding, stepBackEmbedding] = await Promise.all([
    embeddings.embedQuery(originalQuestion),
    embeddings.embedQuery(stepBackQuestion),
  ]);

  const [originalResult, stepBackResult] = await Promise.all([
    searchNotebookChunks(notebookId, originalEmbedding),
    searchNotebookChunks(notebookId, stepBackEmbedding),
  ]);

  const uniqueChunks = new Map<string, RetrievedChunk>();
  for (const chunk of [
    ...originalResult.chunks,
    ...stepBackResult.chunks,
  ]) {
    uniqueChunks.set(chunk.id, chunk);
  }

  return {
    contextChunks: [...uniqueChunks.values()].map((chunk) => chunk.content),
    debug: {
      original: originalResult.debug,
      stepBack: stepBackResult.debug,
      uniqueChunkCount: uniqueChunks.size,
    },
  };
}
