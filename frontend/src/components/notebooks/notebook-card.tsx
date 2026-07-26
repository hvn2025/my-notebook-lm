import { ArrowRight, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NotebookSummary } from "@/types/notebook";
import { NotebookOptions } from "./notebook-options";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function NotebookCard({ notebook }: { notebook: NotebookSummary }) {
  return (
    <Card className="relative h-full gap-0 py-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        aria-label={`Open ${notebook.title}`}
        className="group flex h-full flex-col gap-4 pt-4"
        href={`/notebooks/${notebook.id}`}
      >
        <CardHeader className="pr-16">
          <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <BookOpen className="size-5" />
          </span>
          <CardTitle className="line-clamp-2 font-serif text-lg font-semibold">
            {notebook.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <FileText className="size-4" />
          <span>{notebook.sourceCount} {notebook.sourceCount === 1 ? "source" : "sources"}</span>
        </CardContent>
        <CardFooter className="mt-auto justify-between text-xs text-muted-foreground">
          <span>Updated {dateFormatter.format(new Date(notebook.updatedAt))}</span>
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </CardFooter>
      </Link>
      <NotebookOptions notebook={notebook} />
    </Card>
  );
}
