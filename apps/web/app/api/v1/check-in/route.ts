import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { loadCheckInSummary } from "@/lib/check-in/load";
import { checkInQuerySchema, formatZodError } from "@/lib/check-in/validation";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const url = new URL(request.url);
  const parsedQuery = checkInQuerySchema.safeParse({
    period: url.searchParams.get("period") ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError(formatZodError(parsedQuery.error), 400);
  }

  const { period } = parsedQuery.data;
  const summary = await loadCheckInSummary(getDb(), userOrError.id, period);

  return jsonData({ period, summary });
}
