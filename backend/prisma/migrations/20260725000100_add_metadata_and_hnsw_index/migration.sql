-- Create enums
CREATE TYPE "SourceStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE "SourceType" AS ENUM (
  'PDF',
  'URL',
  'YOUTUBE'
);

-- Add User metadata
ALTER TABLE "User"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add Notebook metadata
ALTER TABLE "Notebook"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add Source ingestion metadata
ALTER TABLE "Source"
ADD COLUMN "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "type" "SourceType" NOT NULL,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add DocumentChunk metadata and make embeddings nullable
ALTER TABLE "DocumentChunk"
ADD COLUMN "chunkIndex" INTEGER NOT NULL,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "embedding" DROP NOT NULL;

-- Create the cosine-distance HNSW vector index
CREATE INDEX "DocumentChunk_embedding_hnsw_idx"
ON "DocumentChunk"
USING hnsw ("embedding" vector_cosine_ops);