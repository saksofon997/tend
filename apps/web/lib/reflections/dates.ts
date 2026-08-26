import { calendarDateString, shiftCalendarDate } from "@tend/domain";

export function reflectionDayKind(
  entryDate: string,
  today: string,
): "today" | "yesterday" | "other" {
  if (entryDate === today) {
    return "today";
  }

  if (entryDate === shiftCalendarDate(today, -1)) {
    return "yesterday";
  }

  return "other";
}

export function todayCalendarDate(now = new Date()): string {
  return calendarDateString(now);
}

export function entriesByDate<T extends { entryDate: string }>(entries: T[]): Map<string, T> {
  return new Map(entries.map((entry) => [entry.entryDate, entry]));
}
