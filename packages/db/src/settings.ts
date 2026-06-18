import { eq } from "drizzle-orm";
import type { Database } from "./client";
import { userSettings } from "./schema";

export type UserSettingsRow = typeof userSettings.$inferSelect;

export async function getUserSettings(
  database: Database,
  userId: string,
): Promise<UserSettingsRow | null> {
  const [settings] = await database
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return settings ?? null;
}

export async function completeOnboarding(
  database: Database,
  userId: string,
): Promise<UserSettingsRow> {
  const now = new Date();

  const [settings] = await database
    .update(userSettings)
    .set({ onboardingCompletedAt: now })
    .where(eq(userSettings.userId, userId))
    .returning();

  if (!settings) {
    throw new Error("User settings not found");
  }

  return settings;
}

export async function updateUserTimezone(
  database: Database,
  userId: string,
  timezone: string,
): Promise<UserSettingsRow> {
  const [settings] = await database
    .update(userSettings)
    .set({ timezone })
    .where(eq(userSettings.userId, userId))
    .returning();

  if (!settings) {
    throw new Error("User settings not found");
  }

  return settings;
}

export function isOnboardingComplete(settings: UserSettingsRow | null): boolean {
  return Boolean(settings?.onboardingCompletedAt);
}
