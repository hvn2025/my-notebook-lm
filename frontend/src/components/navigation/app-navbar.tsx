"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BrainCircuit, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import { getNotebook } from "@/lib/api/notebooks";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useProfile();
  const insideNotebook = pathname !== "/notebooks";
  const notebookId = pathname.match(/^\/notebooks\/([^/]+)/)?.[1] ?? "";
  const notebook = useQuery({
    queryKey: ["notebook", notebookId],
    queryFn: () => getNotebook(notebookId),
    enabled: Boolean(notebookId),
  });

  async function signOut() {
    await createClient().auth.signOut();
    queryClient.clear();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b bg-card/95 backdrop-blur">
      <nav className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {insideNotebook ? (
            <Link
              aria-label="Back to notebooks"
              className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "shrink-0")}
              href="/notebooks"
            >
              <ArrowLeft />
            </Link>
          ) : null}
          <Link className="flex min-w-0 items-center gap-2" href="/notebooks">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BrainCircuit className="size-5" />
            </span>
            <span className="truncate font-serif text-lg font-semibold sm:text-xl">
              My Notebook LM
            </span>
          </Link>
          {notebook.data ? (
            <>
              <span className="hidden h-5 w-px bg-border lg:block" />
              <span className="hidden max-w-64 truncate text-sm text-muted-foreground lg:block">
                {notebook.data.title}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {profile.data ? (
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:block">
              {profile.data.username}
            </span>
          ) : null}
          <Button onClick={signOut} size="sm" variant="outline">
            <LogOut /> <span>Sign out</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
