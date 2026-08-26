import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "./client";
import { reflections } from "./schema";

export type ReflectionRow = typeof reflections.$inferSelect;

export interface ListReflectionsOptions {
  from?: string;
  to?: string;
}

export async function listReflectionsForUser(
  database: Database,
  userId: string,
  options: ListReflectionsOptions = {},
): Promise<ReflectionRow[]> {
  const filters = [eq(reflections.userId, userId)];

  if (options.from) {
    filters.push(gte(reflections.entryDate, options.from));
  }

  if (options.to) {
    filters.push(lte(reflections.entryDate, options.to));
  }

  return database
    .select()
    .from(reflections)
    .where(and(...filters))
    .orderBy(desc(reflections.entryDate));
}

export async function getReflectionForUser(
  database: Database,
  userId: string,
  entryDate: string,
): Promise<ReflectionRow | null> {
  const [row] = await database
    .select()
    .from(reflections)
    .where(and(eq(reflections.userId, userId), eq(reflections.entryDate, entryDate)))
    .limit(1);

  return row ?? null;
}

export async function upsertReflectionForUser(
  database: Database,
  userId: string,
  input: { entryDate: string; body: string },
): Promise<ReflectionRow> {
  const now = new Date();
  const [row] = await database
    .insert(reflections)
    .values({
      userId,
      entryDate: input.entryDate,
      body: input.body,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [reflections.userId, reflections.entryDate],
      set: {
        body: input.body,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("Failed to save reflection");
  }

  return row;
}

export async function deleteReflectionForUser(
  database: Database,
  userId: string,
  entryDate: string,
): Promise<boolean> {
  const deleted = await database
    .delete(reflections)
    .where(and(eq(reflections.userId, userId), eq(reflections.entryDate, entryDate)))
    .returning({ id: reflections.id });

  return deleted.length > 0;
}
