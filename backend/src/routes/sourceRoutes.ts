import { Router } from "express";
import { pdfUpload } from "../config/upload.js";
import {
  getSourceStatus,
  registerUrlSource,
  uploadPdfSource,
} from "../controllers/sourceController.js";

export const sourceRouter = Router();

sourceRouter.post("/upload", pdfUpload.single("file"), uploadPdfSource);
sourceRouter.post("/url", registerUrlSource);
sourceRouter.get("/:id/status", getSourceStatus);
