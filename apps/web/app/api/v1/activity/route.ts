import { serializeActivityEntry } from "@/lib/activity/serialize";
import { formatZodError, listActivityQuerySchema } from "@/lib/activity/validation";
import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { listRecentEventsForUser } from "@tend/db";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const url = new URL(request.url);
  const parsedQuery = listActivityQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError(formatZodError(parsedQuery.error), 400);
  }

  const rows = await listRecentEventsForUser(getDb(), userOrError.id, parsedQuery.data.limit);

  return jsonData({
    events: rows.map(serializeActivityEntry),
  });
}
