"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { syncCurrentProfile } from "@/lib/api/profile";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") ?? "");
  const [isPending, setIsPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const { error: authError } = await createClient().auth.signInWithPassword({
        email: String(form.get("email") ?? "").trim().toLowerCase(),
        password: String(form.get("password") ?? ""),
      });
      if (authError) throw authError;

      await syncCurrentProfile();
      router.replace("/notebooks");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="email">
        Email
        <Input
          className="h-11 px-3 text-base md:text-base"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="password">
        Password
        <Input
          className="h-11 px-3 text-base md:text-base"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <Button className="h-11 w-full text-base" size="lg" disabled={isPending} type="submit">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link className="font-medium text-primary hover:underline" href="/sign-up">
          Create an account
        </Link>
      </p>
    </form>
  );
}
