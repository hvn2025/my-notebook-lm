import { unlink } from "node:fs/promises";
import { resolveTemporaryUploadPath } from "./upload-path.js";

export async function removeUploadedFile(filePath: string) {
  try {
    await unlink(resolveTemporaryUploadPath(filePath));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error(`Unable to remove uploaded file ${filePath}:`, error);
    }
  }
}
