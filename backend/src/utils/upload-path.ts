import path from "node:path";
import { uploadDirectory } from "../config/paths.js";

export function resolveTemporaryUploadPath(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(uploadDirectory, resolvedPath);
  const isOutsideUploadDirectory =
    relativePath.startsWith("..") || path.isAbsolute(relativePath);

  if (isOutsideUploadDirectory) {
    throw new Error("Refusing to access a file outside the uploads directory");
  }

  return resolvedPath;
}
