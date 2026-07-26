import type { NextFunction, Request, Response } from "express";
import { getAuthIdentity } from "../middleware/auth.middleware.js";
import {
  ensureUserProfile,
  isUsernameAvailable,
} from "../services/user.service.js";

export async function getCurrentUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const user = await ensureUserProfile(getAuthIdentity(request));
    response.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function syncCurrentUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const user = await ensureUserProfile(
      getAuthIdentity(request),
      request.body?.username,
    );
    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function checkUsernameAvailability(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    response.json(await isUsernameAvailable(request.query.username));
  } catch (error) {
    next(error);
  }
}
