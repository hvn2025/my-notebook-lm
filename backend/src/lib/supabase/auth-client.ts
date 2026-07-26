import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";

let authClient: SupabaseClient | undefined;

export function getSupabaseAuthClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required for authentication",
    );
  }

  authClient ??= createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return authClient;
}
