import type { Locale } from "@/lib/i18n/dictionaries";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  sr: "sr-RS",
};

interface RelativeFormatOptions {
  locale?: Locale;
  prefix?: string;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRelativeFromDays(
  daysSince: number | null,
  { locale = "en", prefix }: RelativeFormatOptions = {},
): string {
  if (daysSince === null) {
    if (prefix) {
      return locale === "sr" ? "Nikad pobrinuto" : "Never tended";
    }

    if (locale === "sr") {
      return "Nikad pobrinuto";
    }

    return "Never tended";
  }

  if (daysSince === 0) {
    if (prefix) {
      return locale === "sr" ? `${prefix} danas` : `${prefix} today`;
    }

    if (locale === "sr") {
      return "Pobrinuto danas";
    }

    return "Last tended today";
  }

  if (daysSince === 1) {
    if (prefix) {
      return locale === "sr" ? `${prefix} juče` : `${prefix} yesterday`;
    }

    if (locale === "sr") {
      return "Pobrinuto juče";
    }

    return "Last tended yesterday";
  }

  if (prefix) {
    return locale === "sr" ? `${prefix} pre ${daysSince} dana` : `${prefix} ${daysSince} days ago`;
  }

  if (locale === "sr") {
    return `Poslednji put pobrinuto pre ${daysSince} dana`;
  }

  return `Last tended ${daysSince} days ago`;
}

export function formatRelativeTended(
  lastTendedAt: Date | null,
  now = new Date(),
  options: RelativeFormatOptions = {},
): string {
  if (lastTendedAt === null) {
    return formatRelativeFromDays(null, options);
  }

  const days = Math.max(
    0,
    Math.floor((startOfDay(now).getTime() - startOfDay(lastTendedAt).getTime()) / MS_PER_DAY),
  );

  return formatRelativeFromDays(days, options);
}

export function formatRhythm(days: number): string {
  if (days === 1) {
    return "Every day";
  }

  if (days === 7) {
    return "Every 7 days";
  }

  if (days === 14) {
    return "Every 2 weeks";
  }

  if (days === 30) {
    return "Every month";
  }

  return `Every ${days} days`;
}

export function formatEventDate(date: Date | string, locale: Locale = "en"): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return value.toLocaleDateString(DATE_LOCALES[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDatePickerLabel(value: string, locale: Locale = "en"): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(DATE_LOCALES[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
