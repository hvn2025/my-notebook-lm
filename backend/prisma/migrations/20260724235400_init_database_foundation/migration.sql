-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notebook" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Notebook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "notebookId" UUID NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentChunk" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Notebook_userId_idx" ON "public"."Notebook"("userId");

-- CreateIndex
CREATE INDEX "Source_notebookId_idx" ON "public"."Source"("notebookId");

-- CreateIndex
CREATE INDEX "DocumentChunk_sourceId_idx" ON "public"."DocumentChunk"("sourceId");

-- AddForeignKey
ALTER TABLE "public"."Notebook"
ADD CONSTRAINT "Notebook_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Source"
ADD CONSTRAINT "Source_notebookId_fkey"
FOREIGN KEY ("notebookId") REFERENCES "public"."Notebook"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentChunk"
ADD CONSTRAINT "DocumentChunk_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
