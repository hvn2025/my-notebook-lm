import { BrainCircuit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f6f3ee] px-4 py-8 sm:px-6">
      <div className="absolute -left-32 top-10 size-80 rounded-full bg-[#d8f3ef]/60 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-72 rounded-full bg-white/80 blur-3xl" />
      <div className="relative w-full max-w-xl">
        <div className="mb-7 flex items-center justify-center gap-3 text-primary">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="size-6" />
          </span>
          <span className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            My Notebook LM
          </span>
        </div>
        <Card className="rounded-3xl bg-card/95 py-7 shadow-xl shadow-black/5 ring-1 ring-border/70 sm:py-9">
          <CardHeader className="px-5 sm:px-10">
            <CardTitle className="font-serif text-2xl font-semibold sm:text-3xl">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6 sm:text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 sm:px-10">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
