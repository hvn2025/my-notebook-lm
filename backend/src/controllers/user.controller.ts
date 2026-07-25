import type { NextFunction, Request, Response } from "express";
import { upsertUser } from "../services/user.service.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : "";

  if (!emailPattern.test(email)) {
    response.status(400).json({ error: "A valid email is required" });
    return;
  }

  try {
    const user = await upsertUser(email);
    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}
