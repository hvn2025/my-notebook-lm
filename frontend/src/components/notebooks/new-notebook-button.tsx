"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateNotebook } from "@/hooks/use-notebooks";

export function NewNotebookButton() {
  const router = useRouter();
  const createNotebook = useCreateNotebook();

  async function create() {
    try {
      const notebook = await createNotebook.mutateAsync();
      router.push(`/notebooks/${notebook.id}`);
    } catch {
      // TanStack Query exposes the error directly below the button.
    }
  }

  return (
    <div className="space-y-2 sm:text-right">
      <Button
        className="w-full rounded-xl sm:w-auto"
        disabled={createNotebook.isPending}
        onClick={() => void create()}
        size="lg"
      >
        {createNotebook.isPending ? <Spinner /> : <Plus />}
        {createNotebook.isPending ? "Opening…" : "New notebook"}
      </Button>
      {createNotebook.error ? (
        <Alert className="max-w-sm text-left" variant="destructive">
          <AlertDescription>{createNotebook.error.message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
