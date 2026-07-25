import { SourceStatus, SourceType } from "@prisma/client";
import { prisma } from "../config/db.js";
import { HttpError } from "../errors/http-error.js";
import {
  enqueueIngestionJob,
  type IngestionJobData,
} from "../lib/queue/index.js";

interface PdfSourceInput {
  notebookId: string;
  title: string;
  filePath: string;
}

interface UrlSourceInput {
  notebookId: string;
  url: string;
}

async function assertNotebookExists(notebookId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: { id: true },
  });

  if (!notebook) {
    throw new HttpError(404, "Notebook not found");
  }
}

async function enqueueSource(sourceId: string, data: IngestionJobData) {
  try {
    await enqueueIngestionJob(data);
  } catch (error) {
    await prisma.source
      .update({
        where: { id: sourceId },
        data: { status: SourceStatus.FAILED },
      })
      .catch((updateError: unknown) => {
        console.error("Unable to mark source as failed:", updateError);
      });

    throw new HttpError(503, "Unable to enqueue source for ingestion");
  }
}

export async function createPdfSource(input: PdfSourceInput) {
  await assertNotebookExists(input.notebookId);

  const source = await prisma.source.create({
    data: {
      notebookId: input.notebookId,
      title: input.title,
      type: SourceType.PDF,
      status: SourceStatus.PENDING,
    },
    select: { id: true, status: true },
  });

  await enqueueSource(source.id, {
    sourceId: source.id,
    type: "PDF",
    filePath: input.filePath,
  });

  return source;
}

export async function createUrlSource(input: UrlSourceInput) {
  await assertNotebookExists(input.notebookId);
  const parsedUrl = new URL(input.url);

  const source = await prisma.source.create({
    data: {
      notebookId: input.notebookId,
      title: parsedUrl.hostname,
      url: parsedUrl.toString(),
      type: SourceType.URL,
      status: SourceStatus.PENDING,
    },
    select: { id: true, status: true },
  });

  await enqueueSource(source.id, {
    sourceId: source.id,
    type: "URL",
    url: parsedUrl.toString(),
  });

  return source;
}

export async function findSourceStatus(sourceId: string) {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: { id: true, status: true, type: true, updatedAt: true },
  });

  if (!source) {
    throw new HttpError(404, "Source not found");
  }

  return source;
}
