import { type SQL, eq, gte, lte, sql } from "drizzle-orm";
import { tendEvents, tendItems } from "./schema";

export interface ActivityEventFilter {
  query?: string;
  type?: "must" | "want";
  from?: Date;
  to?: Date;
}

export function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function hasActivityEventFilter(filter: ActivityEventFilter | undefined): boolean {
  if (!filter) {
    return false;
  }

  return Boolean(filter.query?.trim() || filter.type || filter.from || filter.to);
}

export function activityEventFilterConditions(filter: ActivityEventFilter | undefined): SQL[] {
  if (!filter) {
    return [];
  }

  const conditions: SQL[] = [];
  const query = filter.query?.trim();

  if (query) {
    const pattern = `%${escapeIlikePattern(query)}%`;
    conditions.push(sql`${tendItems.name} ilike ${pattern} escape '\\'`);
  }

  if (filter.type) {
    conditions.push(eq(tendItems.type, filter.type));
  }

  if (filter.from) {
    conditions.push(gte(tendEvents.tendedAt, filter.from));
  }

  if (filter.to) {
    conditions.push(lte(tendEvents.tendedAt, filter.to));
  }

  return conditions;
}
