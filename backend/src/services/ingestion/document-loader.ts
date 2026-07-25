import { access } from "node:fs/promises";
import type { DocumentInterface } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import type { IngestionJobData } from "../../lib/queue/index.js";
import { resolveTemporaryUploadPath } from "../../utils/upload-path.js";

async function loadPdf(filePath?: string): Promise<DocumentInterface[]> {
  if (!filePath) {
    throw new Error("PDF ingestion job is missing filePath");
  }

  const resolvedPath = resolveTemporaryUploadPath(filePath);
  await access(resolvedPath);

  const loader = new PDFLoader(resolvedPath, { splitPages: true });
  return loader.load();
}

async function loadWebPage(urlValue?: string): Promise<DocumentInterface[]> {
  if (!urlValue) {
    throw new Error("URL ingestion job is missing url");
  }

  const url = new URL(urlValue);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL ingestion only supports HTTP and HTTPS URLs");
  }

  const loader = new CheerioWebBaseLoader(url.toString(), {
    selector: "body",
    timeout: 15_000,
  });
  return loader.load();
}

export function loadSourceDocuments(
  jobData: IngestionJobData,
): Promise<DocumentInterface[]> {
  if (jobData.type === "PDF") {
    return loadPdf(jobData.filePath);
  }

  return loadWebPage(jobData.url);
}
