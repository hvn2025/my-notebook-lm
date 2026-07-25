import { Router } from "express";
import { chatRouter } from "./chat.routes.js";
import { healthRouter } from "./health.routes.js";
import { userRouter } from "./user.routes.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/test-chat", chatRouter);
router.use("/api/users", userRouter);
