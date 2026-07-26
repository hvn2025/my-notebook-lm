import { requestAuthenticatedJson } from "./http";
import type { SourceRecord } from "@/types/workspace";

interface SourceListResponse {
  sources: SourceRecord[];
}

export interface SourceCreatedResponse {
  sourceId: string;
  status: "PENDING";
}

export async function getSources(notebookId: string) {
  const query = new URLSearchParams({ notebookId });
  return (
    await requestAuthenticatedJson<SourceListResponse>(`/api/sources?${query}`)
  ).sources;
}

export function uploadPdf(notebookId: string, file: File) {
  const body = new FormData();
  body.append("notebookId", notebookId);
  body.append("file", file);
  return requestAuthenticatedJson<SourceCreatedResponse>("/api/sources/upload", {
    method: "POST",
    body,
  });
}

export function addUrlSource(notebookId: string, url: string) {
  return requestAuthenticatedJson<SourceCreatedResponse>("/api/sources/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebookId, url }),
  });
}

export function deleteSource(sourceId: string) {
  return requestAuthenticatedJson<{ sourceId: string; deleted: true }>(
    `/api/sources/${sourceId}`,
    { method: "DELETE" },
  );
}
