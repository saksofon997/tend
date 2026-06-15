import { formatZodError, updateEventSchema } from "@/lib/activity/validation";
import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeItem, serializeTendEvent } from "@/lib/items/serialize";
import { deleteEventForUser, getEventForUser, updateEventForUser } from "@tend/db";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { eventId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const existing = await getEventForUser(getDb(), userOrError.id, eventId);
  if (!existing) {
    return jsonError("Event not found", 404);
  }

  const result = await updateEventForUser(getDb(), userOrError.id, eventId, parsed.data.tendedAt);

  if (!result) {
    return jsonError("Event not found", 404);
  }

  const now = new Date();

  return jsonData({
    item: serializeItem(result.item, now),
    event: serializeTendEvent(result.event),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userOrError = await requireUser(_request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { eventId } = await context.params;

  const existing = await getEventForUser(getDb(), userOrError.id, eventId);
  if (!existing) {
    return jsonError("Event not found", 404);
  }

  const result = await deleteEventForUser(getDb(), userOrError.id, eventId);
  if (!result) {
    return jsonError("Event not found", 404);
  }

  const now = new Date();

  return jsonData({
    item: serializeItem(result.item, now),
  });
}
