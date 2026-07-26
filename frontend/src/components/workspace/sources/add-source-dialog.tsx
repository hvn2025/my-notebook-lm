"use client";

import { FormEvent, useState } from "react";
import { FileUp, Link2, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddSourceDialogProps {
  disabled: boolean;
  isAdding: boolean;
  onPdf: (file: File) => Promise<unknown>;
  onUrl: (url: string) => Promise<unknown>;
}

export function AddSourceDialog(props: AddSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    try {
      await action();
      setOpen(false);
      setFile(null);
      setUrl("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add source");
    }
  };

  const submitPdf = (event: FormEvent) => {
    event.preventDefault();
    if (file) void run(() => props.onPdf(file));
  };
  const submitUrl = (event: FormEvent) => {
    event.preventDefault();
    if (url.trim()) void run(() => props.onUrl(url.trim()));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={props.disabled}
        render={<Button size="sm" className="rounded-full px-4" />}
      >
        <Plus data-icon="inline-start" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a source</DialogTitle>
          <DialogDescription>
            Upload a PDF or queue a public webpage for indexing.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="pdf">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf"><FileUp /> PDF</TabsTrigger>
            <TabsTrigger value="url"><Link2 /> Website URL</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <form className="space-y-4 pt-2" onSubmit={submitPdf}>
              <Input
                accept="application/pdf,.pdf"
                aria-label="Choose PDF"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                type="file"
              />
              <DialogFooter>
                <Button disabled={!file || props.isAdding} type="submit">
                  {props.isAdding ? <Spinner /> : <FileUp />} Upload PDF
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="url">
            <form className="space-y-4 pt-2" onSubmit={submitUrl}>
              <Input
                aria-label="Website URL"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/article"
                type="url"
                value={url}
              />
              <DialogFooter>
                <Button disabled={!url.trim() || props.isAdding} type="submit">
                  {props.isAdding ? <Spinner /> : <Link2 />} Add URL
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      </DialogContent>
    </Dialog>
  );
}
