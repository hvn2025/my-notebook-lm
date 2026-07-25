import { Router } from "express";
import { postChat } from "../controllers/chatController.js";

export const apiChatRouter = Router();

apiChatRouter.post("/", postChat);
