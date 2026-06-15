import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeItem, serializeTendEvent, statusForItem } from "@/lib/items/serialize";
import { formatZodError, tendItemSchema } from "@/lib/items/validation";
import { getItemForUser, tendItemForUser } from "@tend/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  let body: unknown = {};
  if (request.headers.get("content-length") !== "0") {
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }
  }

  const parsed = tendItemSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const existing = await getItemForUser(getDb(), userOrError.id, id);
  if (!existing) {
    return jsonError("Item not found", 404);
  }

  const now = new Date();
  const tendedAt = parsed.data.tendedAt ?? now;
  const status = statusForItem({ lastTendedAt: tendedAt, rhythmDays: existing.rhythmDays }, now);

  const result = await tendItemForUser(getDb(), userOrError.id, id, tendedAt, status);
  if (!result) {
    return jsonError("Item not found", 404);
  }

  return jsonData({
    item: serializeItem(result.item, now),
    event: serializeTendEvent(result.event),
  });
}
