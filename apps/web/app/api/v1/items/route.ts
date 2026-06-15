import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeItem, statusForItem } from "@/lib/items/serialize";
import { createItemSchema, formatZodError, listItemsQuerySchema } from "@/lib/items/validation";
import { createItemForUser, listItemsForUser } from "@tend/db";

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
  const items = await listItemsForUser(getDb(), userOrError.id, parsedQuery.data);

  return jsonData({
    items: items.map((item) => serializeItem(item, now)),
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

  const item = await createItemForUser(getDb(), userOrError.id, {
    name: parsed.data.name,
    type: parsed.data.type,
    rhythmDays: parsed.data.rhythmDays,
    lifeArea: parsed.data.lifeArea,
    lastTendedAt,
    status,
  });

  return jsonData({ item: serializeItem(item, now) }, 201);
}
