-- Store private Supabase Storage object paths for persistent PDF sources.
ALTER TABLE "Source" ADD COLUMN "storagePath" TEXT;

CREATE UNIQUE INDEX "Source_storagePath_key" ON "Source"("storagePath");
