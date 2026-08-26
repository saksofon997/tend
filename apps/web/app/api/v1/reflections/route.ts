import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeReflection } from "@/lib/reflections/serialize";
import { formatZodError, listReflectionsQuerySchema } from "@/lib/reflections/validation";
import { listReflectionsForUser } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const url = new URL(request.url);
  const parsedQuery = listReflectionsQuerySchema.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError(formatZodError(parsedQuery.error), 400);
  }

  const entries = await listReflectionsForUser(getDb(), userOrError.id, parsedQuery.data);

  return jsonData({
    entries: entries.map(serializeReflection),
  });
}
