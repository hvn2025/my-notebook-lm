"use client";

import { useState, type FormEvent } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useNotebookActions } from "@/hooks/use-notebooks";
import type { NotebookSummary } from "@/types/notebook";

type OptionView = "options" | "rename" | "delete";

export function NotebookOptions({ notebook }: { notebook: NotebookSummary }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<OptionView>("options");
  const [title, setTitle] = useState(notebook.title);
  const { renameMutation, deleteMutation } = useNotebookActions();
  const pending = renameMutation.isPending || deleteMutation.isPending;
  const error = renameMutation.error ?? deleteMutation.error;

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) {
      setView("options");
      setTitle(notebook.title);
      renameMutation.reset();
      deleteMutation.reset();
    }
  }

  async function rename(event: FormEvent) {
    event.preventDefault();
    try {
      await renameMutation.mutateAsync({ id: notebook.id, title: title.trim() });
      changeOpen(false);
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  async function remove() {
    try {
      await deleteMutation.mutateAsync(notebook.id);
      changeOpen(false);
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button
            aria-label={`Options for ${notebook.title}`}
            className="absolute right-3 top-3 z-10 rounded-full bg-card/90"
            size="icon"
            variant="ghost"
          />
        }
      >
        <EllipsisVertical />
      </DialogTrigger>
      <DialogContent>
        {view === "options" ? (
          <OptionsView title={notebook.title} onSelect={setView} />
        ) : view === "rename" ? (
          <form className="grid gap-4" onSubmit={rename}>
            <DialogHeader>
              <DialogTitle>Rename notebook</DialogTitle>
              <DialogDescription>Choose a clear title up to 120 characters.</DialogDescription>
            </DialogHeader>
            <Input autoFocus maxLength={120} onChange={(event) => setTitle(event.target.value)} value={title} />
            {error ? <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert> : null}
            <DialogFooter>
              <Button onClick={() => setView("options")} type="button" variant="outline">Back</Button>
              <Button disabled={!title.trim() || pending} type="submit">{pending ? <Spinner /> : <Pencil />} Save title</Button>
            </DialogFooter>
          </form>
        ) : (
          <DeleteView error={error} pending={pending} title={notebook.title} onBack={() => setView("options")} onDelete={remove} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function OptionsView({ title, onSelect }: { title: string; onSelect: (view: OptionView) => void }) {
  return (
    <>
      <DialogHeader><DialogTitle>Notebook options</DialogTitle><DialogDescription>{title}</DialogDescription></DialogHeader>
      <div className="grid gap-2">
        <Button className="h-11 justify-start" onClick={() => onSelect("rename")} variant="outline"><Pencil /> Edit title</Button>
        <Button className="h-11 justify-start" onClick={() => onSelect("delete")} variant="destructive"><Trash2 /> Delete notebook</Button>
      </div>
    </>
  );
}

function DeleteView(props: { title: string; pending: boolean; error: Error | null; onBack: () => void; onDelete: () => Promise<void> }) {
  return (
    <>
      <DialogHeader><DialogTitle>Delete notebook?</DialogTitle><DialogDescription>“{props.title}” and all its sources and chunks will be permanently deleted.</DialogDescription></DialogHeader>
      {props.error ? <Alert variant="destructive"><AlertDescription>{props.error.message}</AlertDescription></Alert> : null}
      <DialogFooter>
        <Button disabled={props.pending} onClick={props.onBack} variant="outline">Back</Button>
        <Button disabled={props.pending} onClick={() => void props.onDelete()} variant="destructive">{props.pending ? <Spinner /> : <Trash2 />} Delete permanently</Button>
      </DialogFooter>
    </>
  );
}
