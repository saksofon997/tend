import { jsonError } from "@/lib/api";
import type { AuthUser } from "@/lib/auth/lucia";
import { getSessionIdFromRequest, validateSessionFromId } from "@/lib/auth/session";
import type { NextResponse } from "next/server";

export async function requireUser(request: Request): Promise<AuthUser | NextResponse> {
  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) {
    return jsonError("Unauthorized", 401);
  }

  const { user } = await validateSessionFromId(sessionId);
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return user;
}

export function isErrorResponse(value: AuthUser | NextResponse): value is NextResponse {
  return value instanceof Response;
}
