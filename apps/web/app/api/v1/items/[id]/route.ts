import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeItem, serializeTendEvent, statusForItem } from "@/lib/items/serialize";
import {
  getSharedUserMapForItems,
  resolveSharedWithUserId,
  sharedUserForItem,
} from "@/lib/items/sharing";
import { formatZodError, updateItemSchema } from "@/lib/items/validation";
import {
  deleteItemForUser,
  getItemForUser,
  getRecentEventsForItem,
  updateItemForUser,
} from "@tend/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  const userOrError = await requireUser(_request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;
  const now = new Date();
  const database = getDb();
  const item = await getItemForUser(database, userOrError.id, id);

  if (!item) {
    return jsonError("Item not found", 404);
  }

  const [recentEvents, sharedUserMap] = await Promise.all([
    getRecentEventsForItem(database, userOrError.id, id),
    getSharedUserMapForItems(database, userOrError.id, [item]),
  ]);

  return jsonData({
    item: serializeItem(
      item,
      now,
      sharedUserForItem(item, userOrError.id, sharedUserMap),
      userOrError.id,
    ),
    recentEvents: recentEvents.map(serializeTendEvent),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const database = getDb();
  const existing = await getItemForUser(database, userOrError.id, id);
  if (!existing) {
    return jsonError("Item not found", 404);
  }

  const now = new Date();
  const nextLastTendedAt =
    parsed.data.lastTendedAt !== undefined ? parsed.data.lastTendedAt : existing.lastTendedAt;
  const nextRhythmDays = parsed.data.rhythmDays ?? existing.rhythmDays;

  const updatePayload: {
    name?: string;
    type?: typeof existing.type;
    rhythmDays?: number;
    lifeArea?: typeof existing.lifeArea | null;
    lastTendedAt?: Date | null;
    status?: typeof existing.status;
    archivedAt?: Date | null;
    sharedWithUserId?: string | null;
  } = {};

  if (parsed.data.name !== undefined) {
    updatePayload.name = parsed.data.name;
  }
  if (parsed.data.type !== undefined) {
    updatePayload.type = parsed.data.type;
  }
  if (parsed.data.rhythmDays !== undefined) {
    updatePayload.rhythmDays = parsed.data.rhythmDays;
  }
  if (parsed.data.lifeArea !== undefined) {
    updatePayload.lifeArea = parsed.data.lifeArea;
  }
  if (parsed.data.lastTendedAt !== undefined) {
    updatePayload.lastTendedAt = parsed.data.lastTendedAt;
  }
  if (parsed.data.archived === true) {
    updatePayload.archivedAt = now;
  }
  if (parsed.data.archived === false) {
    updatePayload.archivedAt = null;
  }

  if (parsed.data.sharedWithEmail !== undefined) {
    try {
      updatePayload.sharedWithUserId = await resolveSharedWithUserId(
        database,
        userOrError,
        parsed.data.sharedWithEmail,
      );
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Unable to share this item", 400);
    }
  }

  updatePayload.status = statusForItem(
    { lastTendedAt: nextLastTendedAt, rhythmDays: nextRhythmDays },
    now,
  );

  const item = await updateItemForUser(database, userOrError.id, id, updatePayload);
  if (!item) {
    return jsonError("Item not found", 404);
  }
  const sharedUserMap = await getSharedUserMapForItems(database, userOrError.id, [item]);

  return jsonData({
    item: serializeItem(
      item,
      now,
      sharedUserForItem(item, userOrError.id, sharedUserMap),
      userOrError.id,
    ),
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;
  const url = new URL(request.url);

  if (url.searchParams.get("confirm") !== "true") {
    return jsonError("Add ?confirm=true to permanently delete this item", 400);
  }

  const deleted = await deleteItemForUser(getDb(), userOrError.id, id);
  if (!deleted) {
    return jsonError("Item not found", 404);
  }

  return jsonData({ ok: true });
}
