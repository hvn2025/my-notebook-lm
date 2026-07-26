import { Router } from "express";
import {
  createNotebook,
  deleteNotebook,
  getNotebook,
  listNotebooks,
  updateNotebook,
} from "../controllers/notebook.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const notebookRouter = Router();

notebookRouter.use(requireAuth);
notebookRouter.get("/", listNotebooks);
notebookRouter.post("/", createNotebook);
notebookRouter.get("/:id", getNotebook);
notebookRouter.patch("/:id", updateNotebook);
notebookRouter.delete("/:id", deleteNotebook);
