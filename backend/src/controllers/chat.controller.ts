import type { NextFunction, Request, Response } from "express";
import { answerFromMemory } from "../services/rag.service.js";

export async function testChat(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const question =
    typeof request.body?.question === "string"
      ? request.body.question.trim()
      : "";

  if (!question) {
    response.status(400).json({ error: "Question is required" });
    return;
  }

  try {
    const answer = await answerFromMemory(question);
    response.json({ answer });
  } catch (error) {
    next(error);
  }
}
