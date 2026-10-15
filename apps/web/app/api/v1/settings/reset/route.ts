import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { formatZodError, resetTendSchema } from "@/lib/settings/validation";
import { deleteItemsForUser } from "@tend/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = resetTendSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const deletedItems = await deleteItemsForUser(getDb(), userOrError.id);
  return jsonData({ ok: true, deletedItems });
}
