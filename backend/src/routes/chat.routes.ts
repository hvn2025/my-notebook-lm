import { Router } from "express";
import { testChat } from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/", testChat);
