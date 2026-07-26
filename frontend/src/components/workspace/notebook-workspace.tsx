"use client";

import { useMemo, useState } from "react";
import { useSources } from "@/hooks/use-sources";
import { ChatPanel } from "./chat/chat-panel";
import { SourcesPanel } from "./sources/sources-panel";
import { StudioPanel } from "./studio/studio-panel";

export function NotebookWorkspace({ notebookId }: { notebookId: string }) {
  const sourceState = useSources(notebookId);
  const [excludedIds, setExcludedIds] = useState(() => new Set<string>());
  const selectedIds = useMemo(
    () =>
      sourceState.sources
        .filter(
          (source) =>
            source.status === "COMPLETED" && !excludedIds.has(source.id),
        )
        .map((source) => source.id),
    [excludedIds, sourceState.sources],
  );

  const toggleSource = (sourceId: string, selected: boolean) => {
    setExcludedIds((current) => {
      const next = new Set(current);
      if (selected) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  };

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[#f6f3ee] p-3 sm:p-4 xl:h-[calc(100svh-4rem)] xl:overflow-hidden">
      <div className="mx-auto grid max-w-[1600px] gap-3 lg:grid-cols-[300px_minmax(0,1fr)] xl:h-full xl:grid-cols-[300px_minmax(460px,1fr)_330px]">
        <section className="h-[34rem] min-w-0 sm:h-[40rem] xl:h-full">
          <SourcesPanel
            {...sourceState}
            configured={Boolean(notebookId)}
            selectedIds={selectedIds}
            onToggle={toggleSource}
          />
        </section>
        <section className="h-[calc(100svh-6rem)] min-h-[38rem] min-w-0 xl:h-full xl:min-h-0">
          <ChatPanel notebookId={notebookId} selectedIds={selectedIds} />
        </section>
        <section className="h-[46rem] min-w-0 lg:col-span-2 xl:col-span-1 xl:h-full">
          <StudioPanel />
        </section>
      </div>
    </main>
  );
}
