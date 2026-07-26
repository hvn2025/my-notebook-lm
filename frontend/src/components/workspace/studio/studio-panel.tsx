import { AudioLines, FileChartColumn, Network, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelHeader } from "../panel-header";
import { StudioActionCard } from "./studio-action-card";

const studioActions = [
  {
    title: "Audio Overview",
    description: "Two hosts discuss your sources in a podcast-style deep dive.",
    action: "Generate",
    icon: AudioLines,
  },
  {
    title: "Video Overview",
    description: "Narrated slides that walk through the main arguments.",
    action: "Generate",
    icon: Video,
  },
  {
    title: "Mind Map",
    description: "A branching map of themes and how the sources connect.",
    action: "Create",
    icon: Network,
  },
  {
    title: "Reports",
    description: "Create a briefing document, study guide, FAQ, or timeline.",
    action: "Choose",
    icon: FileChartColumn,
  },
];

export function StudioPanel() {
  return (
    <Card className="h-full gap-0 overflow-hidden rounded-[22px] bg-[#fffefa] py-0 shadow-sm ring-[#e3ded5]">
      <PanelHeader title="Studio" description="Turn sources into outputs" />
      <CardContent className="min-h-0 flex-1 p-3">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-2">
            {studioActions.map((action) => (
              <StudioActionCard key={action.title} {...action} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
