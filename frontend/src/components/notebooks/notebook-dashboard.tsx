"use client";

import { BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotebooks } from "@/hooks/use-notebooks";
import { useProfile } from "@/hooks/use-profile";
import { NewNotebookButton } from "./new-notebook-button";
import { NotebookCard } from "./notebook-card";

export function NotebookDashboard() {
  const profile = useProfile();
  const { notebooksQuery } = useNotebooks();
  const error = profile.error ?? notebooksQuery.error;
  const notebooks = notebooksQuery.data ?? [];

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[#f6f3ee]">
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-primary">
              {profile.data ? `Welcome, ${profile.data.username}` : "Your workspace"}
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Your notebooks
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Continue your research or open a fresh workspace for new sources.
            </p>
          </div>
          <NewNotebookButton />
        </div>

        {error ? (
          <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>
        ) : notebooksQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => <Skeleton className="h-52 rounded-2xl" key={item} />)}
          </div>
        ) : notebooks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notebooks.map((notebook) => <NotebookCard notebook={notebook} key={notebook.id} />)}
          </div>
        ) : (
          <Empty className="min-h-80 rounded-2xl border bg-card/70">
            <EmptyHeader>
              <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
              <EmptyTitle>No notebooks yet</EmptyTitle>
              <EmptyDescription>
                Use New notebook above, then add a PDF or website. We will name it automatically.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </main>
  );
}
