import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";
import { getAuthIdentity } from "../middleware/auth.middleware.js";
import {
  createUserNotebook,
  deleteOwnedNotebook,
  findOwnedNotebook,
  listUserNotebooks,
  renameOwnedNotebook,
} from "../services/notebook.service.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readNotebookId(request: Request) {
  const notebookId = Array.isArray(request.params.id)
    ? request.params.id[0]
    : request.params.id;
  if (!notebookId || !uuidPattern.test(notebookId)) {
    throw new HttpError(400, "A valid notebook id is required");
  }
  return notebookId;
}

function readTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";
  if (!title || title.length > 120) {
    throw new HttpError(400, "Title must be between 1 and 120 characters");
  }
  return title;
}

export async function listNotebooks(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const notebooks = await listUserNotebooks(getAuthIdentity(request));
    response.json({ notebooks });
  } catch (error) {
    next(error);
  }
}

export async function createNotebook(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const notebook = await createUserNotebook(getAuthIdentity(request));
    response.status(201).json({ notebook });
  } catch (error) {
    next(error);
  }
}

export async function getNotebook(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const notebookId = readNotebookId(request);
    const notebook = await findOwnedNotebook(
      getAuthIdentity(request),
      notebookId,
    );
    response.json({ notebook });
  } catch (error) {
    next(error);
  }
}

export async function updateNotebook(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const notebook = await renameOwnedNotebook(
      getAuthIdentity(request),
      readNotebookId(request),
      readTitle(request.body?.title),
    );
    response.json({ notebook });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotebook(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteOwnedNotebook(
      getAuthIdentity(request),
      readNotebookId(request),
    );
    response.json(result);
  } catch (error) {
    next(error);
  }
}
