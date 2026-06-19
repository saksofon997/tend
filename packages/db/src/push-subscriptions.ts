import { and, eq } from "drizzle-orm";
import type { Database } from "./client";
import { pushSubscriptions } from "./schema";

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

export interface UpsertPushSubscriptionInput {
  token: string;
  platform: string;
}

export async function upsertPushSubscriptionForUser(
  database: Database,
  userId: string,
  input: UpsertPushSubscriptionInput,
): Promise<PushSubscriptionRow> {
  const now = new Date();
  const [subscription] = await database
    .insert(pushSubscriptions)
    .values({
      userId,
      token: input.token,
      platform: input.platform,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.token,
      set: {
        userId,
        platform: input.platform,
        lastNotifiedItemId: null,
        lastNotifiedAt: null,
        updatedAt: now,
      },
    })
    .returning();

  if (!subscription) {
    throw new Error("Failed to save push subscription");
  }

  return subscription;
}

export async function deletePushSubscriptionForUser(
  database: Database,
  userId: string,
  token: string,
): Promise<boolean> {
  const deleted = await database
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.token, token)))
    .returning({ id: pushSubscriptions.id, userId: pushSubscriptions.userId });

  return deleted.length > 0;
}

export async function deletePushSubscriptionByToken(
  database: Database,
  token: string,
): Promise<boolean> {
  const deleted = await database
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.token, token))
    .returning({ id: pushSubscriptions.id });

  return deleted.length > 0;
}

export async function listPushSubscriptions(database: Database): Promise<PushSubscriptionRow[]> {
  return database.select().from(pushSubscriptions).orderBy(pushSubscriptions.createdAt);
}

export async function markPushSubscriptionNotified(
  database: Database,
  subscriptionId: string,
  input: {
    itemId: string;
    notifiedAt: Date;
  },
): Promise<PushSubscriptionRow | null> {
  const [subscription] = await database
    .update(pushSubscriptions)
    .set({
      lastNotifiedItemId: input.itemId,
      lastNotifiedAt: input.notifiedAt,
      updatedAt: input.notifiedAt,
    })
    .where(eq(pushSubscriptions.id, subscriptionId))
    .returning();

  return subscription ?? null;
}
