import { FileText, Globe2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import type { SourceRecord } from "@/types/workspace";
import { DeleteSourceDialog } from "./delete-source-dialog";

const sourceIcons = { PDF: FileText, URL: Globe2, YOUTUBE: Video };
const iconColors = { PDF: "text-rose-500", URL: "text-emerald-600", YOUTUBE: "text-violet-500" };

interface SourceItemProps {
  source: SourceRecord;
  selected: boolean;
  onToggle: (selected: boolean) => void;
  deleting: boolean;
  onDelete: () => Promise<unknown>;
}

function sourceDetail(source: SourceRecord) {
  if (source.status === "COMPLETED") {
    return `${source.type} · ${source.chunkCount} chunks`;
  }
  if (source.status === "FAILED") return "Indexing failed";
  if (source.status === "PROCESSING") return "Indexing…";
  return "Waiting in queue…";
}

export function SourceItem({
  source,
  selected,
  deleting,
  onDelete,
  onToggle,
}: SourceItemProps) {
  const Icon = sourceIcons[source.type];
  const isReady = source.status === "COMPLETED";

  return (
    <Item className="bg-[#f5f2ec]" size="sm" variant="muted">
      <ItemMedia className={iconColors[source.type]}><Icon /></ItemMedia>
      <ItemContent>
        <ItemTitle title={source.title}>{source.title}</ItemTitle>
        <ItemDescription className={source.status === "FAILED" ? "text-destructive" : ""}>
          {sourceDetail(source)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {!isReady && source.status !== "FAILED" ? <Spinner className="text-primary" /> : null}
        {source.status === "FAILED" ? <Badge variant="destructive">Failed</Badge> : null}
        <DeleteSourceDialog
          onConfirm={onDelete}
          pending={deleting}
          sourceTitle={source.title}
        />
        <Checkbox
          aria-label={`Use ${source.title} in chat`}
          checked={selected}
          disabled={!isReady}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
      </ItemActions>
    </Item>
  );
}
