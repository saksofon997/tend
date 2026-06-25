import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeItem, statusForItem } from "@/lib/items/serialize";
import {
  getSharedUserMapForItems,
  resolveSharedWithUserId,
  sharedUserForItem,
} from "@/lib/items/sharing";
import { createItemSchema, formatZodError, listItemsQuerySchema } from "@/lib/items/validation";
import { createItemForUser, listItemsForUser } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const url = new URL(request.url);
  const parsedQuery = listItemsQuerySchema.safeParse({
    includeArchived: url.searchParams.get("includeArchived") ?? undefined,
    lifeArea: url.searchParams.get("lifeArea") ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError(formatZodError(parsedQuery.error), 400);
  }

  const now = new Date();
  const database = getDb();
  const items = await listItemsForUser(database, userOrError.id, parsedQuery.data);
  const sharedUserMap = await getSharedUserMapForItems(database, userOrError.id, items);

  return jsonData({
    items: items.map((item) =>
      serializeItem(
        item,
        now,
        sharedUserForItem(item, userOrError.id, sharedUserMap),
        userOrError.id,
      ),
    ),
  });
}

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

  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const now = new Date();
  const lastTendedAt = parsed.data.lastTendedAt ?? now;
  const status = statusForItem({ lastTendedAt, rhythmDays: parsed.data.rhythmDays }, now);
  const database = getDb();

  let sharedWithUserId: string | null | undefined;
  try {
    sharedWithUserId = await resolveSharedWithUserId(
      database,
      userOrError,
      parsed.data.sharedWithEmail,
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to share this item", 400);
  }

  const item = await createItemForUser(database, userOrError.id, {
    name: parsed.data.name,
    type: parsed.data.type,
    rhythmDays: parsed.data.rhythmDays,
    lifeArea: parsed.data.lifeArea,
    lastTendedAt,
    status,
    sharedWithUserId,
  });
  const sharedUserMap = await getSharedUserMapForItems(database, userOrError.id, [item]);

  return jsonData(
    {
      item: serializeItem(
        item,
        now,
        sharedUserForItem(item, userOrError.id, sharedUserMap),
        userOrError.id,
      ),
    },
    201,
  );
}
