import { SourceStatus, SourceType } from "@prisma/client";
import { prisma } from "../config/db.js";
import { HttpError } from "../errors/http-error.js";
import {
  enqueueIngestionJob,
  removeIngestionJob,
  type IngestionJobData,
} from "../lib/queue/index.js";
import type { AuthIdentity } from "../types/auth.js";
import {
  buildPdfStoragePath,
  deleteStoredPdf,
  storePdf,
} from "./source-storage.service.js";
import {
  requireOwnedNotebook,
  requireOwnedSource,
} from "./ownership.service.js";

interface PdfSourceInput {
  identity: AuthIdentity;
  notebookId: string;
  title: string;
  filePath: string;
}

interface UrlSourceInput {
  identity: AuthIdentity;
  notebookId: string;
  url: string;
}

async function enqueueSource(data: IngestionJobData) {
  try {
    await enqueueIngestionJob(data);
  } catch (error) {
    console.error(`Unable to enqueue source ${data.sourceId}:`, error);
    throw new HttpError(503, "Unable to enqueue source for ingestion");
  }
}

async function rollbackSource(sourceId: string, storagePath?: string) {
  if (storagePath) {
    await deleteStoredPdf(storagePath).catch((error: unknown) => {
      console.error(`Unable to roll back stored PDF ${storagePath}:`, error);
    });
  }
  await prisma.source.deleteMany({ where: { id: sourceId } });
}

export async function createPdfSource(input: PdfSourceInput) {
  await requireOwnedNotebook(input.identity, input.notebookId);
  const source = await prisma.source.create({
    data: {
      notebookId: input.notebookId,
      title: input.title,
      type: SourceType.PDF,
      status: SourceStatus.PENDING,
    },
    select: { id: true, status: true },
  });
  const storagePath = buildPdfStoragePath(
    input.identity.authUserId,
    input.notebookId,
    source.id,
  );

  try {
    await storePdf(input.filePath, storagePath);
    await prisma.source.update({
      where: { id: source.id },
      data: { storagePath },
    });
    await enqueueSource({ sourceId: source.id, type: "PDF", storagePath });
    return source;
  } catch (error) {
    await rollbackSource(source.id, storagePath);
    throw error;
  }
}

export async function createUrlSource(input: UrlSourceInput) {
  await requireOwnedNotebook(input.identity, input.notebookId);
  const url = new URL(input.url).toString();
  const source = await prisma.source.create({
    data: {
      notebookId: input.notebookId,
      title: new URL(url).hostname,
      url,
      type: SourceType.URL,
      status: SourceStatus.PENDING,
    },
    select: { id: true, status: true },
  });

  try {
    await enqueueSource({ sourceId: source.id, type: "URL", url });
    return source;
  } catch (error) {
    await rollbackSource(source.id);
    throw error;
  }
}

export async function findSourceStatus(
  identity: AuthIdentity,
  sourceId: string,
) {
  await requireOwnedSource(identity, sourceId);
  return prisma.source.findUniqueOrThrow({
    where: { id: sourceId },
    select: { id: true, status: true, type: true, updatedAt: true },
  });
}

export async function findSourcesByNotebook(
  identity: AuthIdentity,
  notebookId: string,
) {
  await requireOwnedNotebook(identity, notebookId);
  return prisma.source.findMany({
    where: { notebookId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      url: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { chunks: true } },
    },
  });
}

export async function deleteSource(identity: AuthIdentity, sourceId: string) {
  const { source } = await requireOwnedSource(identity, sourceId);
  let jobState = "unavailable";

  try {
    jobState = await removeIngestionJob(sourceId);
  } catch (error) {
    console.error(`Unable to remove ingestion job ${sourceId}:`, error);
  }

  if (source.storagePath) await deleteStoredPdf(source.storagePath);
  await prisma.source.delete({ where: { id: sourceId } });
  return { sourceId, deleted: true, jobState };
}
