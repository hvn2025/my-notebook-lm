import { prisma } from "../config/db.js";
import { HttpError } from "../errors/http-error.js";
import type { AuthIdentity } from "../types/auth.js";
import { ensureUserProfile } from "./user.service.js";
import { UNTITLED_NOTEBOOK_TITLE } from "./notebook-title.service.js";
import { requireOwnedNotebook } from "./ownership.service.js";
import { deleteStoredPdfs } from "./source-storage.service.js";
import { removeIngestionJob } from "../lib/queue/index.js";

const notebookSelect = {
  id: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { sources: true } },
} as const;

function toNotebookDto(notebook: {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { sources: number };
}) {
  const { _count, ...data } = notebook;
  return { ...data, sourceCount: _count.sources };
}

export async function listUserNotebooks(identity: AuthIdentity) {
  const user = await ensureUserProfile(identity);
  const notebooks = await prisma.notebook.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: notebookSelect,
  });
  return notebooks.map(toNotebookDto);
}

export async function createUserNotebook(
  identity: AuthIdentity,
) {
  const user = await ensureUserProfile(identity);
  const notebook = await prisma.notebook.create({
    data: { title: UNTITLED_NOTEBOOK_TITLE, userId: user.id },
    select: notebookSelect,
  });
  return toNotebookDto(notebook);
}

export async function findOwnedNotebook(
  identity: AuthIdentity,
  notebookId: string,
) {
  const user = await ensureUserProfile(identity);
  const notebook = await prisma.notebook.findFirst({
    where: { id: notebookId, userId: user.id },
    select: notebookSelect,
  });

  if (!notebook) {
    throw new HttpError(404, "Notebook not found");
  }
  return toNotebookDto(notebook);
}

export async function renameOwnedNotebook(
  identity: AuthIdentity,
  notebookId: string,
  title: string,
) {
  await requireOwnedNotebook(identity, notebookId);
  const notebook = await prisma.notebook.update({
    where: { id: notebookId },
    data: { title },
    select: notebookSelect,
  });
  return toNotebookDto(notebook);
}

export async function deleteOwnedNotebook(
  identity: AuthIdentity,
  notebookId: string,
) {
  await requireOwnedNotebook(identity, notebookId);
  const sources = await prisma.source.findMany({
    where: { notebookId },
    select: { id: true, storagePath: true },
  });

  const queueResults = await Promise.allSettled(
    sources.map((source) => removeIngestionJob(source.id)),
  );
  queueResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Unable to remove ingestion job ${sources[index]?.id}:`,
        result.reason,
      );
    }
  });

  const storagePaths = sources.flatMap((source) =>
    source.storagePath ? [source.storagePath] : [],
  );
  await deleteStoredPdfs(storagePaths);
  await prisma.notebook.delete({ where: { id: notebookId } });
  return { notebookId, deleted: true as const };
}
