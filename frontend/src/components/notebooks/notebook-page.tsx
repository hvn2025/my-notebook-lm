"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotebookWorkspace } from "@/components/workspace/notebook-workspace";
import { getNotebook } from "@/lib/api/notebooks";
import { cn } from "@/lib/utils";

export function NotebookPage({ notebookId }: { notebookId: string }) {
  const notebook = useQuery({
    queryKey: ["notebook", notebookId],
    queryFn: () => getNotebook(notebookId),
  });

  if (notebook.isLoading) {
    return <Skeleton className="m-4 h-[calc(100svh-6rem)] rounded-2xl" />;
  }

  if (notebook.error || !notebook.data) {
    return (
      <main className="grid min-h-svh place-items-center bg-background p-5">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {notebook.error?.message ?? "Notebook not found"}
            </AlertDescription>
          </Alert>
          <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} href="/notebooks">
            <ArrowLeft /> Back to notebooks
          </Link>
        </div>
      </main>
    );
  }

  return <NotebookWorkspace notebookId={notebookId} />;
}
