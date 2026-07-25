import { mkdirSync } from "node:fs";
import path from "node:path";

export const uploadDirectory = path.resolve(process.cwd(), "uploads");

export function ensureUploadDirectory() {
  mkdirSync(uploadDirectory, { recursive: true });
}
