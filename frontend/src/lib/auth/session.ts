import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requirePageUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) redirect("/sign-in");
  return { userId };
}

export async function redirectAuthenticatedUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/notebooks");
}
