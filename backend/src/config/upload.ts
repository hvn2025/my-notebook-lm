import { randomUUID } from "node:crypto";
import path from "node:path";
import multer from "multer";
import { HttpError } from "../errors/http-error.js";
import { ensureUploadDirectory, uploadDirectory } from "./paths.js";

ensureUploadDirectory();

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, _file, callback) => {
    callback(null, `${randomUUID()}.pdf`);
  },
});

export const pdfUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const hasPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";
    const hasPdfMimeType = file.mimetype === "application/pdf";

    if (!hasPdfExtension || !hasPdfMimeType) {
      callback(new HttpError(415, "Only PDF uploads are accepted"));
      return;
    }

    callback(null, true);
  },
});
