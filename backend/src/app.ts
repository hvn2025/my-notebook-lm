import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());
app.use(router);
app.use(errorHandler);
