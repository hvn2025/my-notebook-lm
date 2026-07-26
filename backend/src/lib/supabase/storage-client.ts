import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";
import { HttpError } from "../../errors/http-error.js";

let storageClient: SupabaseClient | undefined;

export function getSupabaseStorageClient() {
  if (storageClient) return storageClient;

  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    throw new HttpError(
      503,
      "Supabase Storage is not configured on the backend",
    );
  }

  storageClient = createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return storageClient;
}
