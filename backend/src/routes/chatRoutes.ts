import { Router } from "express";
import { postChat } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const apiChatRouter = Router();

apiChatRouter.post("/", requireAuth, postChat);
