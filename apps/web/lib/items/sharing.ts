import type { SharedTendUserResponse } from "@/lib/items/serialize";
import type { Database, TendItemRow, UserSummary } from "@tend/db";
import { findUserByEmail, listUserSummariesByIds } from "@tend/db";

export type ResolvedSharedWithUserId = string | null | undefined;

export function sharedUserIdForItem(item: TendItemRow, currentUserId: string): string | null {
  if (item.userId === currentUserId) {
    return item.sharedWithUserId;
  }

  return item.userId;
}

export async function getSharedUserMapForItems(
  database: Database,
  currentUserId: string,
  items: TendItemRow[],
): Promise<Map<string, UserSummary>> {
  const sharedUserIds = items
    .map((item) => sharedUserIdForItem(item, currentUserId))
    .filter((userId): userId is string => Boolean(userId));
  const users = await listUserSummariesByIds(database, sharedUserIds);

  return new Map(users.map((user) => [user.id, user]));
}

export function sharedUserForItem(
  item: TendItemRow,
  currentUserId: string,
  userMap: Map<string, UserSummary>,
): SharedTendUserResponse | null {
  const sharedUserId = sharedUserIdForItem(item, currentUserId);
  if (!sharedUserId) {
    return null;
  }

  return userMap.get(sharedUserId) ?? null;
}

export async function resolveSharedWithUserId(
  database: Database,
  currentUser: { id: string; email: string },
  sharedWithEmail: string | null | undefined,
): Promise<ResolvedSharedWithUserId> {
  if (sharedWithEmail === undefined) {
    return undefined;
  }

  if (sharedWithEmail === null || sharedWithEmail.trim() === "") {
    return null;
  }

  const normalizedEmail = sharedWithEmail.trim().toLowerCase();
  if (normalizedEmail === currentUser.email.toLowerCase()) {
    throw new Error("Add a friend's email, not your own");
  }

  const sharedUser = await findUserByEmail(database, normalizedEmail);
  if (!sharedUser) {
    throw new Error("No Tend account found for that email");
  }

  return sharedUser.id;
}
