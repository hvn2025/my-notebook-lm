import { requestAuthenticatedJson, requestJson } from "./http";
import type { UserProfile } from "@/types/auth";

interface UserResponse {
  user: UserProfile;
}

export async function getCurrentProfile() {
  return (await requestAuthenticatedJson<UserResponse>("/api/users/me")).user;
}

export async function syncCurrentProfile(username?: string) {
  return (
    await requestAuthenticatedJson<UserResponse>("/api/users/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(username ? { username } : {}),
    })
  ).user;
}

export function checkUsernameAvailability(username: string) {
  const query = new URLSearchParams({ username });
  return requestJson<{ username: string; available: boolean }>(
    `/api/users/username-available?${query}`,
  );
}
