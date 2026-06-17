import type { ActivityEntryResponse } from "@/lib/activity/serialize";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ActivityWeekGroup {
  key: string;
  label: string;
  entries: ActivityEntryResponse[];
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function formatWeekStart(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatActivityWeekLabel(weekStart: Date, now = new Date()): string {
  const currentWeekStart = startOfWeek(now);
  const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * MS_PER_DAY);

  if (sameCalendarDay(weekStart, currentWeekStart)) {
    return "This week";
  }

  if (sameCalendarDay(weekStart, previousWeekStart)) {
    return "Last week";
  }

  return `Week of ${formatWeekStart(weekStart)}`;
}

export function groupActivityEntriesByWeek(
  entries: ActivityEntryResponse[],
  now = new Date(),
): ActivityWeekGroup[] {
  const groups = new Map<string, ActivityWeekGroup>();
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.tendedAt).getTime() - new Date(a.tendedAt).getTime(),
  );

  for (const entry of sortedEntries) {
    const weekStart = startOfWeek(new Date(entry.tendedAt));
    const key = toDateKey(weekStart);
    const existing = groups.get(key);

    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(key, {
      key,
      label: formatActivityWeekLabel(weekStart, now),
      entries: [entry],
    });
  }

  return Array.from(groups.values());
}
