"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkUsernameAvailability,
  syncCurrentProfile,
} from "@/lib/api/profile";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim().toLowerCase();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const availability = await checkUsernameAvailability(username);
      if (!availability.available) throw new Error("That username is already taken");

      const { data, error: authError } = await createClient().auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/notebooks`,
        },
      });
      if (authError) throw authError;

      if (data.session) {
        await syncCurrentProfile(username);
        router.replace("/notebooks");
        router.refresh();
      } else {
        setConfirmationEmail(email);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign up");
    } finally {
      setIsPending(false);
    }
  }

  if (confirmationEmail) {
    return (
      <Alert>
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          We sent a confirmation link to {confirmationEmail}. Confirm it to open your notebooks.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="username">
        Username
        <Input className="h-11 px-3 text-base md:text-base" id="username" name="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" required />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="email">
        Email
        <Input className="h-11 px-3 text-base md:text-base" id="email" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-1.5 text-sm font-medium" htmlFor="password">
        Password
        <Input className="h-11 px-3 text-base md:text-base" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <Button className="h-11 w-full text-base" size="lg" disabled={isPending} type="submit">
        {isPending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}<Link className="font-medium text-primary hover:underline" href="/sign-in">Sign in</Link>
      </p>
    </form>
  );
}
