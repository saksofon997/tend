import { eq } from "drizzle-orm";
import type { Database } from "./client";
import { availabilityWindows } from "./schema";

export type AvailabilityWindowRow = typeof availabilityWindows.$inferSelect;

export interface AvailabilityWindowInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function listAvailabilityWindowsForUser(
  database: Database,
  userId: string,
): Promise<AvailabilityWindowRow[]> {
  return database
    .select()
    .from(availabilityWindows)
    .where(eq(availabilityWindows.userId, userId))
    .orderBy(availabilityWindows.dayOfWeek, availabilityWindows.startTime);
}

export async function replaceAvailabilityWindowsForUser(
  database: Database,
  userId: string,
  windows: AvailabilityWindowInput[],
): Promise<AvailabilityWindowRow[]> {
  return database.transaction(async (tx) => {
    await tx.delete(availabilityWindows).where(eq(availabilityWindows.userId, userId));

    if (windows.length === 0) {
      return [];
    }

    return tx
      .insert(availabilityWindows)
      .values(
        windows.map((window) => ({
          userId,
          dayOfWeek: window.dayOfWeek,
          startTime: normalizeTimeForDb(window.startTime),
          endTime: normalizeTimeForDb(window.endTime),
        })),
      )
      .returning();
  });
}

export async function deleteAvailabilityWindowsForUser(
  database: Database,
  userId: string,
): Promise<void> {
  await database.delete(availabilityWindows).where(eq(availabilityWindows.userId, userId));
}

function normalizeTimeForDb(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}:00`;
}

export function normalizeTimeFromDb(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}
