import { Router } from "express";
import { createUser } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.post("/", createUser);
