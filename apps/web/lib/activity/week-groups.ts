import type { ActivityEntryResponse } from "@/lib/activity/serialize";
import type { Locale } from "@/lib/i18n/dictionaries";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  sr: "sr-RS",
};

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

function formatWeekStart(date: Date, locale: Locale): string {
  return date.toLocaleDateString(DATE_LOCALES[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatActivityWeekLabel(
  weekStart: Date,
  now = new Date(),
  locale: Locale = "en",
): string {
  const currentWeekStart = startOfWeek(now);
  const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * MS_PER_DAY);

  if (sameCalendarDay(weekStart, currentWeekStart)) {
    return locale === "sr" ? "Ove nedelje" : "This week";
  }

  if (sameCalendarDay(weekStart, previousWeekStart)) {
    return locale === "sr" ? "Prošle nedelje" : "Last week";
  }

  return locale === "sr"
    ? `Nedelja od ${formatWeekStart(weekStart, locale)}`
    : `Week of ${formatWeekStart(weekStart, locale)}`;
}

export function groupActivityEntriesByWeek(
  entries: ActivityEntryResponse[],
  now = new Date(),
  locale: Locale = "en",
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
      label: formatActivityWeekLabel(weekStart, now, locale),
      entries: [entry],
    });
  }

  return Array.from(groups.values());
}
