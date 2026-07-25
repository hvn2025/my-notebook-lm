import type { NextFunction, Request, Response } from "express";
import {
  createPdfSource,
  createUrlSource,
  findSourceStatus,
} from "../services/source.service.js";
import { removeUploadedFile } from "../utils/uploaded-file.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseHttpUrl(value: unknown) {
  try {
    const url = new URL(readString(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function uploadPdfSource(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const file = request.file;
  const notebookId = readString(request.body?.notebookId);

  if (!file) {
    response.status(400).json({ error: "A PDF file is required" });
    return;
  }

  if (!uuidPattern.test(notebookId)) {
    await removeUploadedFile(file.path);
    response.status(400).json({ error: "A valid notebookId is required" });
    return;
  }

  try {
    const source = await createPdfSource({
      notebookId,
      title: file.originalname,
      filePath: file.path,
    });
    response.status(202).json({ sourceId: source.id, status: source.status });
  } catch (error) {
    await removeUploadedFile(file.path);
    next(error);
  }
}

export async function registerUrlSource(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const notebookId = readString(request.body?.notebookId);
  const url = parseHttpUrl(request.body?.url);

  if (!uuidPattern.test(notebookId)) {
    response.status(400).json({ error: "A valid notebookId is required" });
    return;
  }

  if (!url) {
    response.status(400).json({ error: "A valid HTTP or HTTPS URL is required" });
    return;
  }

  try {
    const source = await createUrlSource({ notebookId, url });
    response.status(202).json({ sourceId: source.id, status: source.status });
  } catch (error) {
    next(error);
  }
}

export async function getSourceStatus(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const sourceId = readString(request.params.id);

  if (!uuidPattern.test(sourceId)) {
    response.status(400).json({ error: "A valid source id is required" });
    return;
  }

  try {
    const source = await findSourceStatus(sourceId);
    response.json({
      sourceId: source.id,
      status: source.status,
      type: source.type,
      updatedAt: source.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}
