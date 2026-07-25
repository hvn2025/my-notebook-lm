import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { HttpError } from "../errors/http-error.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: "Internal server error" });
}
