import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PanelHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <CardHeader className="min-h-[78px] grid-cols-[1fr_auto] items-center gap-3 border-b px-5 py-4">
      <div className="min-w-0">
        <CardTitle className="font-serif text-xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="mt-0.5 truncate text-xs">
          {description}
        </CardDescription>
      </div>
      {action ? <div>{action}</div> : null}
    </CardHeader>
  );
}
