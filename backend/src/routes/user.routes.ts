import { Router } from "express";
import {
  checkUsernameAvailability,
  getCurrentUser,
  syncCurrentUser,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/username-available", checkUsernameAvailability);
userRouter.get("/me", requireAuth, getCurrentUser);
userRouter.post("/me", requireAuth, syncCurrentUser);
