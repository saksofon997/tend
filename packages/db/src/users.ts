import { eq, inArray } from "drizzle-orm";
import type { Database } from "./client";
import { userSettings, users } from "./schema";

export interface UserSummary {
  id: string;
  displayName: string;
  email: string;
}

export async function findUserByEmail(database: Database, email: string) {
  const [user] = await database
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user ?? null;
}

export async function listUserSummariesByIds(
  database: Database,
  userIds: string[],
): Promise<UserSummary[]> {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) {
    return [];
  }

  return database
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
    })
    .from(users)
    .where(inArray(users.id, uniqueIds));
}

export async function createUserRecord(
  database: Database,
  input: {
    displayName: string;
    email: string;
    passwordHash: string;
  },
) {
  const email = input.email.toLowerCase();

  const [user] = await database
    .insert(users)
    .values({
      displayName: input.displayName,
      email,
      passwordHash: input.passwordHash,
    })
    .returning({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
    });

  if (!user) {
    throw new Error("Failed to create user");
  }

  await database.insert(userSettings).values({
    userId: user.id,
    timezone: "UTC",
  });

  return user;
}
