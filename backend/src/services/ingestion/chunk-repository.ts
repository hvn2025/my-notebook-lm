import { randomUUID } from "node:crypto";
import type { DocumentInterface } from "@langchain/core/documents";
import { prisma } from "../../config/db.js";
import { EMBEDDING_DIMENSIONS } from "../../config/open-router-embeddings.js";
import { toPgVectorLiteral } from "../../utils/pg-vector.js";

export async function replaceDocumentChunks(
  sourceId: string,
  chunks: DocumentInterface[],
  embeddings: number[][],
) {
  if (chunks.length !== embeddings.length) {
    throw new Error("Chunk and embedding counts do not match");
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.documentChunk.deleteMany({ where: { sourceId } });

      for (const [chunkIndex, chunk] of chunks.entries()) {
        const embedding = embeddings[chunkIndex];
        if (!embedding) {
          throw new Error(`Missing embedding for chunk ${chunkIndex}`);
        }

        const vector = toPgVectorLiteral(embedding, EMBEDDING_DIMENSIONS);
        await transaction.$executeRaw`
          INSERT INTO "DocumentChunk" (
            "id", "content", "sourceId", "chunkIndex",
            "embedding", "createdAt", "updatedAt"
          )
          VALUES (
            ${randomUUID()}::uuid,
            ${chunk.pageContent},
            ${sourceId}::uuid,
            ${chunkIndex},
            ${vector}::vector(1536),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `;
      }
    },
    { maxWait: 10_000, timeout: 120_000 },
  );
}
