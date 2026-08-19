import { serializeActivityEntry } from "@/lib/activity/serialize";
import {
  activityFilterBounds,
  formatZodError,
  listActivityQuerySchema,
} from "@/lib/activity/validation";
import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { listRecentEventsForUser } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const url = new URL(request.url);
  const parsedQuery = listActivityQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError(formatZodError(parsedQuery.error), 400);
  }

  const { limit, q, type, from, to } = parsedQuery.data;
  const bounds = activityFilterBounds(from, to);
  const rows = await listRecentEventsForUser(getDb(), userOrError.id, limit, {
    query: q,
    type,
    from: bounds.from,
    to: bounds.to,
  });

  return jsonData({
    events: rows.map(serializeActivityEntry),
  });
}
