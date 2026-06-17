import { jsonData } from "@/lib/api";
import {
  clearSessionCookie,
  getSessionIdFromRequest,
  invalidateSession,
  validateSessionFromId,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sessionId = getSessionIdFromRequest(request);
  const { session } = await validateSessionFromId(sessionId);
  await invalidateSession(session);

  const response = jsonData({ ok: true });
  return clearSessionCookie(response);
}
