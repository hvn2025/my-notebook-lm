"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";

interface DeleteSourceDialogProps {
  sourceTitle: string;
  pending: boolean;
  onConfirm: () => Promise<unknown>;
}

export function DeleteSourceDialog(props: DeleteSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setError("");
    try {
      await props.onConfirm();
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete source");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            aria-label={`Delete ${props.sourceTitle}`}
            size="icon-xs"
            variant="ghost"
          />
        }
      >
        <Trash2 />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this source?</DialogTitle>
          <DialogDescription>
            “{props.sourceTitle}” and all of its indexed chunks will be removed
            permanently.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button disabled={props.pending} onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={props.pending} onClick={() => void remove()} variant="destructive">
            {props.pending ? <Spinner /> : <Trash2 />} Delete source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
