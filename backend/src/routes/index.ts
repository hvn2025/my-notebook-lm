import { Router } from "express";
import { chatRouter } from "./chat.routes.js";
import { apiChatRouter } from "./chatRoutes.js";
import { healthRouter } from "./health.routes.js";
import { notebookRouter } from "./notebook.routes.js";
import { sourceRouter } from "./sourceRoutes.js";
import { userRouter } from "./user.routes.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/test-chat", chatRouter);
router.use("/api/chat", apiChatRouter);
router.use("/api/users", userRouter);
router.use("/api/notebooks", notebookRouter);
router.use("/api/sources", sourceRouter);
