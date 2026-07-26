import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StudioActionCardProps {
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
}

export function StudioActionCard(props: StudioActionCardProps) {
  const Icon = props.icon;
  return (
    <Card className="gap-3 rounded-2xl bg-white py-4 shadow-none">
      <CardHeader className="grid-cols-[auto_1fr] items-center gap-3 px-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#d5f1ed] text-primary">
          <Icon className="size-5" />
        </span>
        <CardTitle className="text-base font-semibold">{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-sm leading-6 text-muted-foreground">{props.description}</p>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button disabled className="rounded-full" size="sm">
                <Plus /> {props.action}
              </Button>
            </TooltipTrigger>
            <TooltipContent>This output does not have a backend route yet.</TooltipContent>
          </Tooltip>
          <Button disabled className="rounded-full" size="sm" variant="outline">
            Customize
          </Button>
          <Badge className="ml-auto" variant="secondary">Soon</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
