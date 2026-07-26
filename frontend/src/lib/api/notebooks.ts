import { requestAuthenticatedJson } from "./http";
import type { NotebookSummary } from "@/types/notebook";

interface NotebookResponse {
  notebook: NotebookSummary;
}

interface NotebookListResponse {
  notebooks: NotebookSummary[];
}

export async function getNotebooks() {
  return (
    await requestAuthenticatedJson<NotebookListResponse>("/api/notebooks")
  ).notebooks;
}

export async function getNotebook(notebookId: string) {
  return (
    await requestAuthenticatedJson<NotebookResponse>(
      `/api/notebooks/${encodeURIComponent(notebookId)}`,
    )
  ).notebook;
}

export async function createNotebook() {
  return (
    await requestAuthenticatedJson<NotebookResponse>("/api/notebooks", {
      method: "POST",
    })
  ).notebook;
}

export async function renameNotebook(notebookId: string, title: string) {
  return (
    await requestAuthenticatedJson<NotebookResponse>(
      `/api/notebooks/${encodeURIComponent(notebookId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      },
    )
  ).notebook;
}

export function deleteNotebook(notebookId: string) {
  return requestAuthenticatedJson<{ notebookId: string; deleted: true }>(
    `/api/notebooks/${encodeURIComponent(notebookId)}`,
    { method: "DELETE" },
  );
}
