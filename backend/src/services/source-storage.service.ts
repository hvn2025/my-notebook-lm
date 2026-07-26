import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { ensureUploadDirectory, uploadDirectory } from "../config/paths.js";
import { HttpError } from "../errors/http-error.js";
import { getSupabaseStorageClient } from "../lib/supabase/storage-client.js";
import { resolveTemporaryUploadPath } from "../utils/upload-path.js";

type StorageError = { message?: string; statusCode?: string | number };

function isMissingBucket(error: StorageError) {
  const status = String(error.statusCode ?? "");
  return status === "404" || /not found/i.test(error.message ?? "");
}

function isDuplicateBucket(error: StorageError) {
  const status = String(error.statusCode ?? "");
  return status === "409" || /already exists|duplicate/i.test(error.message ?? "");
}

function storageFailure(action: string, error: StorageError) {
  console.error(`Supabase Storage ${action} failed:`, error);
  return new HttpError(502, `Unable to ${action} the PDF source`);
}

async function ensurePrivateBucket() {
  const storage = getSupabaseStorageClient().storage;
  const { error } = await storage.getBucket(env.sourceStorageBucket);

  if (!error) return;
  if (!isMissingBucket(error)) throw storageFailure("access", error);

  const result = await storage.createBucket(env.sourceStorageBucket, {
    public: false,
    allowedMimeTypes: ["application/pdf"],
    fileSizeLimit: 25 * 1024 * 1024,
  });

  if (result.error && !isDuplicateBucket(result.error)) {
    throw storageFailure("create storage for", result.error);
  }
}

export function buildPdfStoragePath(
  authUserId: string,
  notebookId: string,
  sourceId: string,
) {
  return `${authUserId}/${notebookId}/${sourceId}.pdf`;
}

export async function storePdf(filePath: string, storagePath: string) {
  await ensurePrivateBucket();
  const contents = await readFile(resolveTemporaryUploadPath(filePath));
  const { error } = await getSupabaseStorageClient()
    .storage.from(env.sourceStorageBucket)
    .upload(storagePath, contents, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw storageFailure("store", error);
}

export async function downloadPdf(storagePath: string) {
  const { data, error } = await getSupabaseStorageClient()
    .storage.from(env.sourceStorageBucket)
    .download(storagePath);

  if (error || !data) throw storageFailure("download", error ?? {});

  ensureUploadDirectory();
  const localPath = path.join(uploadDirectory, `${randomUUID()}.pdf`);
  await writeFile(localPath, Buffer.from(await data.arrayBuffer()));
  return localPath;
}

export async function deleteStoredPdf(storagePath: string) {
  return deleteStoredPdfs([storagePath]);
}

export async function deleteStoredPdfs(storagePaths: string[]) {
  if (storagePaths.length === 0) return;

  const { error } = await getSupabaseStorageClient()
    .storage.from(env.sourceStorageBucket)
    .remove(storagePaths);

  if (error) throw storageFailure("delete", error);
}
