import { createClient } from "@/lib/supabase/client";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
export const apiBaseUrl = configuredBaseUrl.replace(/\/$/, "");

export async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  return (await response.json()) as T;
}

export async function getAccessToken() {
  const { data, error } = await createClient().auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  return data.session.access_token;
}

export async function requestAuthenticatedJson<T>(
  path: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${await getAccessToken()}`);
  return requestJson<T>(path, { ...init, headers });
}
