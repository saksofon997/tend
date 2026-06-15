import { and, desc, eq, isNull } from "drizzle-orm";
import type { Database } from "./client";
import { tendEvents, tendItems } from "./schema";

export type TendItemRow = typeof tendItems.$inferSelect;
export type TendEventRow = typeof tendEvents.$inferSelect;

export interface ListItemsOptions {
  includeArchived?: boolean;
  lifeArea?: TendItemRow["lifeArea"];
}

export interface CreateItemInput {
  name: string;
  type: TendItemRow["type"];
  rhythmDays: number;
  lifeArea?: TendItemRow["lifeArea"] | null;
  lastTendedAt: Date;
  status: TendItemRow["status"];
}

export interface UpdateItemInput {
  name?: string;
  type?: TendItemRow["type"];
  rhythmDays?: number;
  lifeArea?: TendItemRow["lifeArea"] | null;
  lastTendedAt?: Date | null;
  status?: TendItemRow["status"];
  archivedAt?: Date | null;
}

function ownershipFilter(userId: string, itemId: string) {
  return and(eq(tendItems.id, itemId), eq(tendItems.userId, userId));
}

export async function listItemsForUser(
  database: Database,
  userId: string,
  options: ListItemsOptions = {},
): Promise<TendItemRow[]> {
  const filters = [eq(tendItems.userId, userId)];

  if (!options.includeArchived) {
    filters.push(isNull(tendItems.archivedAt));
  }

  if (options.lifeArea) {
    filters.push(eq(tendItems.lifeArea, options.lifeArea));
  }

  return database
    .select()
    .from(tendItems)
    .where(and(...filters))
    .orderBy(desc(tendItems.updatedAt));
}

export async function getItemForUser(
  database: Database,
  userId: string,
  itemId: string,
): Promise<TendItemRow | null> {
  const [item] = await database
    .select()
    .from(tendItems)
    .where(ownershipFilter(userId, itemId))
    .limit(1);

  return item ?? null;
}

export async function createItemForUser(
  database: Database,
  userId: string,
  input: CreateItemInput,
): Promise<TendItemRow> {
  return database.transaction(async (tx) => {
    const [item] = await tx
      .insert(tendItems)
      .values({
        userId,
        name: input.name,
        type: input.type,
        rhythmDays: input.rhythmDays,
        lifeArea: input.lifeArea ?? null,
        lastTendedAt: input.lastTendedAt,
        status: input.status,
      })
      .returning();

    if (!item) {
      throw new Error("Failed to create item");
    }

    await tx.insert(tendEvents).values({
      itemId: item.id,
      tendedAt: input.lastTendedAt,
    });

    return item;
  });
}

export async function updateItemForUser(
  database: Database,
  userId: string,
  itemId: string,
  input: UpdateItemInput,
): Promise<TendItemRow | null> {
  const [item] = await database
    .update(tendItems)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(ownershipFilter(userId, itemId))
    .returning();

  return item ?? null;
}

export async function deleteItemForUser(
  database: Database,
  userId: string,
  itemId: string,
): Promise<boolean> {
  const deleted = await database
    .delete(tendItems)
    .where(ownershipFilter(userId, itemId))
    .returning({ id: tendItems.id });

  return deleted.length > 0;
}

export async function tendItemForUser(
  database: Database,
  userId: string,
  itemId: string,
  tendedAt: Date,
  status: TendItemRow["status"],
): Promise<{ item: TendItemRow; event: TendEventRow } | null> {
  return database.transaction(async (tx) => {
    const [item] = await tx
      .update(tendItems)
      .set({
        lastTendedAt: tendedAt,
        status,
        updatedAt: new Date(),
      })
      .where(ownershipFilter(userId, itemId))
      .returning();

    if (!item) {
      return null;
    }

    const [event] = await tx
      .insert(tendEvents)
      .values({
        itemId: item.id,
        tendedAt,
      })
      .returning();

    if (!event) {
      throw new Error("Failed to create tend event");
    }

    return { item, event };
  });
}

export interface RecentEventWithItem {
  event: TendEventRow;
  item: TendItemRow;
}

export async function listRecentEventsForUser(
  database: Database,
  userId: string,
  limit = 50,
): Promise<RecentEventWithItem[]> {
  return database
    .select({
      event: tendEvents,
      item: tendItems,
    })
    .from(tendEvents)
    .innerJoin(tendItems, eq(tendEvents.itemId, tendItems.id))
    .where(eq(tendItems.userId, userId))
    .orderBy(desc(tendEvents.tendedAt))
    .limit(limit);
}

export async function getRecentEventsForItem(
  database: Database,
  userId: string,
  itemId: string,
  limit = 5,
): Promise<TendEventRow[]> {
  const item = await getItemForUser(database, userId, itemId);
  if (!item) {
    return [];
  }

  return database
    .select()
    .from(tendEvents)
    .where(eq(tendEvents.itemId, itemId))
    .orderBy(desc(tendEvents.tendedAt))
    .limit(limit);
}

export async function getEventForUser(
  database: Database,
  userId: string,
  eventId: string,
): Promise<{ event: TendEventRow; item: TendItemRow } | null> {
  const [row] = await database
    .select({
      event: tendEvents,
      item: tendItems,
    })
    .from(tendEvents)
    .innerJoin(tendItems, eq(tendEvents.itemId, tendItems.id))
    .where(and(eq(tendEvents.id, eventId), eq(tendItems.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}

async function syncItemLastTendedFromEvents(
  tx: Database,
  userId: string,
  itemId: string,
): Promise<TendItemRow | null> {
  const [latest] = await tx
    .select({ tendedAt: tendEvents.tendedAt })
    .from(tendEvents)
    .where(eq(tendEvents.itemId, itemId))
    .orderBy(desc(tendEvents.tendedAt))
    .limit(1);

  const lastTendedAt = latest?.tendedAt ?? null;

  const [item] = await tx
    .update(tendItems)
    .set({
      lastTendedAt,
      updatedAt: new Date(),
    })
    .where(ownershipFilter(userId, itemId))
    .returning();

  return item ?? null;
}

export async function updateEventForUser(
  database: Database,
  userId: string,
  eventId: string,
  tendedAt: Date,
): Promise<{ item: TendItemRow; event: TendEventRow } | null> {
  return database.transaction(async (tx) => {
    const owned = await getEventForUser(tx, userId, eventId);
    if (!owned) {
      return null;
    }

    const [event] = await tx
      .update(tendEvents)
      .set({ tendedAt })
      .where(eq(tendEvents.id, eventId))
      .returning();

    if (!event) {
      return null;
    }

    const item = await syncItemLastTendedFromEvents(tx, userId, owned.item.id);
    if (!item) {
      return null;
    }

    return { item, event };
  });
}

export async function deleteEventForUser(
  database: Database,
  userId: string,
  eventId: string,
): Promise<{ item: TendItemRow } | null> {
  return database.transaction(async (tx) => {
    const owned = await getEventForUser(tx, userId, eventId);
    if (!owned) {
      return null;
    }

    const deleted = await tx
      .delete(tendEvents)
      .where(eq(tendEvents.id, eventId))
      .returning({ id: tendEvents.id });

    if (deleted.length === 0) {
      return null;
    }

    const item = await syncItemLastTendedFromEvents(tx, userId, owned.item.id);
    if (!item) {
      return null;
    }

    return { item };
  });
}

export async function deleteItemsForUser(database: Database, userId: string): Promise<void> {
  await database.delete(tendItems).where(eq(tendItems.userId, userId));
}
