import { prisma } from "../config/db.js";
import { HttpError } from "../errors/http-error.js";
import type { AuthIdentity } from "../types/auth.js";
import { ensureUserProfile } from "./user.service.js";

export async function requireOwnedNotebook(
  identity: AuthIdentity,
  notebookId: string,
) {
  const user = await ensureUserProfile(identity);
  const notebook = await prisma.notebook.findFirst({
    where: { id: notebookId, userId: user.id },
    select: { id: true, userId: true },
  });

  if (!notebook) throw new HttpError(404, "Notebook not found");
  return { user, notebook };
}

export async function requireOwnedSource(
  identity: AuthIdentity,
  sourceId: string,
) {
  const user = await ensureUserProfile(identity);
  const source = await prisma.source.findFirst({
    where: { id: sourceId, notebook: { userId: user.id } },
    select: {
      id: true,
      notebookId: true,
      storagePath: true,
      status: true,
      type: true,
    },
  });

  if (!source) throw new HttpError(404, "Source not found");
  return { user, source };
}

export async function requireOwnedChatSelection(
  identity: AuthIdentity,
  notebookId: string,
  sourceIds?: string[],
) {
  await requireOwnedNotebook(identity, notebookId);
  if (sourceIds === undefined || sourceIds.length === 0) return;

  const ownedCount = await prisma.source.count({
    where: { id: { in: sourceIds }, notebookId },
  });

  if (ownedCount !== sourceIds.length) {
    throw new HttpError(404, "One or more sources were not found");
  }
}
