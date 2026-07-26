import { Router } from "express";
import { pdfUpload } from "../config/upload.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getSourceStatus,
  listSources,
  removeSource,
  registerUrlSource,
  uploadPdfSource,
} from "../controllers/sourceController.js";

export const sourceRouter = Router();

sourceRouter.use(requireAuth);
sourceRouter.post("/upload", pdfUpload.single("file"), uploadPdfSource);
sourceRouter.post("/url", registerUrlSource);
sourceRouter.get("/", listSources);
sourceRouter.get("/:id/status", getSourceStatus);
sourceRouter.delete("/:id", removeSource);
