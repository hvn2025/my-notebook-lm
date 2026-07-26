import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";
import { getSupabaseAuthClient } from "../lib/supabase/auth-client.js";

function readBearerToken(header: string | undefined) {
  const [scheme, token] = header?.trim().split(/\s+/) ?? [];
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = readBearerToken(request.headers.authorization);

  if (!token) {
    next(new HttpError(401, "Authentication is required"));
    return;
  }

  try {
    const { data, error } = await getSupabaseAuthClient().auth.getUser(token);
    const email = data.user?.email?.trim().toLowerCase();

    if (error || !data.user || !email) {
      next(new HttpError(401, "The authentication session is invalid"));
      return;
    }

    const metadataUsername = data.user.user_metadata?.username;
    request.authIdentity = {
      authUserId: data.user.id,
      email,
      suggestedUsername:
        typeof metadataUsername === "string" ? metadataUsername : undefined,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthIdentity(request: Request) {
  if (!request.authIdentity) {
    throw new HttpError(401, "Authentication is required");
  }
  return request.authIdentity;
}
