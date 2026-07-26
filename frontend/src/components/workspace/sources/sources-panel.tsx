"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelHeader } from "../panel-header";
import { AddSourceDialog } from "./add-source-dialog";
import { SourceItem } from "./source-item";
import type { SourceRecord } from "@/types/workspace";

interface SourcesPanelProps {
  configured: boolean;
  sources: SourceRecord[];
  selectedIds: string[];
  isLoading: boolean;
  loadError: Error | null;
  isAdding: boolean;
  uploadPdf: (file: File) => Promise<unknown>;
  addUrl: (url: string) => Promise<unknown>;
  deleteSource: (sourceId: string) => Promise<unknown>;
  deletingSourceId?: string;
  onToggle: (sourceId: string, selected: boolean) => void;
}

export function SourcesPanel(props: SourcesPanelProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? props.sources.filter((source) => source.title.toLowerCase().includes(query))
      : props.sources;
  }, [props.sources, search]);

  return (
    <Card className="h-full gap-0 overflow-hidden rounded-[22px] bg-[#fffefa] py-0 shadow-sm ring-[#e3ded5]">
      <PanelHeader
        title="Sources"
        description={`${props.selectedIds.length} of ${props.sources.length} in context`}
        action={
          <AddSourceDialog
            disabled={!props.configured}
            isAdding={props.isAdding}
            onPdf={props.uploadPdf}
            onUrl={props.addUrl}
          />
        }
      />
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <InputGroup className="h-11 border-transparent bg-[#f4f1eb]">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput
            aria-label="Search sources"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sources"
            value={search}
          />
        </InputGroup>

        {props.loadError ? (
          <Alert variant="destructive"><AlertDescription>{props.loadError.message}</AlertDescription></Alert>
        ) : null}

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 pr-2">
            {props.isLoading ? <SourceSkeletons /> : null}
            {!props.isLoading && filtered.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                selected={props.selectedIds.includes(source.id)}
                deleting={props.deletingSourceId === source.id}
                onDelete={() => props.deleteSource(source.id)}
                onToggle={(selected) => props.onToggle(source.id, selected)}
              />
            ))}
            {!props.isLoading && filtered.length === 0 ? <SourcesEmpty searching={Boolean(search)} /> : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SourceSkeletons() {
  return Array.from({ length: 4 }, (_, index) => (
    <Skeleton className="h-[66px] w-full rounded-xl" key={index} />
  ));
}

function SourcesEmpty({ searching }: { searching: boolean }) {
  return (
    <Empty className="mt-8 border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
        <EmptyTitle>{searching ? "No matching sources" : "No sources yet"}</EmptyTitle>
        <EmptyDescription>
          {searching ? "Try a different search." : "Add a PDF or website to begin."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
