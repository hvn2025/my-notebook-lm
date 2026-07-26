"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNotebook,
  deleteNotebook,
  getNotebooks,
  renameNotebook,
} from "@/lib/api/notebooks";
import type { NotebookSummary } from "@/types/notebook";

const notebooksKey = ["notebooks"] as const;

export function useNotebooks() {
  const notebooksQuery = useQuery({
    queryKey: notebooksKey,
    queryFn: getNotebooks,
  });
  return { notebooksQuery };
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotebook,
    onSuccess: (notebook) => {
      queryClient.setQueryData(
        notebooksKey,
        (current: Awaited<ReturnType<typeof getNotebooks>> = []) => [
          notebook,
          ...current,
        ],
      );
    },
  });
}

export function useNotebookActions() {
  const queryClient = useQueryClient();
  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameNotebook(id, title),
    onSuccess: (notebook) => {
      queryClient.setQueryData<NotebookSummary[]>(notebooksKey, (current = []) =>
        current.map((item) => (item.id === notebook.id ? notebook : item)),
      );
      queryClient.setQueryData(["notebook", notebook.id], notebook);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNotebook,
    onSuccess: ({ notebookId }) => {
      queryClient.setQueryData<NotebookSummary[]>(notebooksKey, (current = []) =>
        current.filter((item) => item.id !== notebookId),
      );
      queryClient.removeQueries({ queryKey: ["notebook", notebookId] });
    },
  });

  return { renameMutation, deleteMutation };
}
