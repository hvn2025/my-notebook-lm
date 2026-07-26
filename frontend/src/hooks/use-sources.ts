"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  addUrlSource,
  deleteSource,
  getSources,
  uploadPdf,
} from "@/lib/api/sources";
import type { SourceRecord } from "@/types/workspace";

const emptySources: SourceRecord[] = [];

export function useSources(notebookId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["sources", notebookId] as const;
  const sourcesQuery = useQuery({
    queryKey,
    queryFn: () => getSources(notebookId),
    enabled: Boolean(notebookId),
    refetchInterval: (query) => {
      const sources = query.state.data;
      const isIngesting = sources?.some(
        (source) =>
          source.status === "PENDING" || source.status === "PROCESSING",
      );
      return isIngesting ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!sourcesQuery.dataUpdatedAt) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notebook", notebookId] }),
      queryClient.invalidateQueries({ queryKey: ["notebooks"] }),
    ]);
  }, [notebookId, queryClient, sourcesQuery.dataUpdatedAt]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["notebooks"] }),
    ]);
  };

  const pdfMutation = useMutation({
    mutationFn: (file: File) => uploadPdf(notebookId, file),
    onSuccess: refresh,
  });
  const urlMutation = useMutation({
    mutationFn: (url: string) => addUrlSource(notebookId, url),
    onSuccess: refresh,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSource,
    onSuccess: refresh,
  });

  return {
    sources: sourcesQuery.data ?? emptySources,
    isLoading: sourcesQuery.isLoading,
    loadError: sourcesQuery.error,
    uploadPdf: pdfMutation.mutateAsync,
    addUrl: urlMutation.mutateAsync,
    deleteSource: deleteMutation.mutateAsync,
    deletingSourceId: deleteMutation.isPending
      ? deleteMutation.variables
      : undefined,
    isAdding: pdfMutation.isPending || urlMutation.isPending,
    addError: pdfMutation.error ?? urlMutation.error ?? deleteMutation.error,
  };
}
