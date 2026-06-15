import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { type AuthUser, type LuciaAuthUser, lucia, toAuthUser } from "@/lib/auth/lucia";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export function getSessionIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${SESSION_COOKIE_NAME}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length) || null;
    }
  }

  return null;
}

export async function validateSessionFromId(sessionId: string | null): Promise<{
  user: AuthUser | null;
  session: Session | null;
}> {
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);

  if (!result.user || !result.session) {
    return { user: null, session: null };
  }

  return {
    user: toAuthUser(result.user as LuciaAuthUser),
    session: result.session,
  };
}

export async function validateSession(): Promise<{
  user: AuthUser | null;
  session: Session | null;
}> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  return validateSessionFromId(sessionId);
}

export function applySessionCookie(response: NextResponse, sessionId: string): NextResponse {
  const sessionCookie = lucia.createSessionCookie(sessionId);
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  const sessionCookie = lucia.createBlankSessionCookie();
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return response;
}

export async function invalidateSession(session: Session | null): Promise<void> {
  if (session) {
    await lucia.invalidateSession(session.id);
  }
}
