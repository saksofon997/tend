const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRelativeFromDays(daysSince: number | null): string {
  if (daysSince === null) {
    return "Never tended";
  }

  if (daysSince === 0) {
    return "Last tended today";
  }

  if (daysSince === 1) {
    return "Last tended yesterday";
  }

  return `Last tended ${daysSince} days ago`;
}

export function formatRelativeTended(lastTendedAt: Date | null, now = new Date()): string {
  if (lastTendedAt === null) {
    return "Never tended";
  }

  const days = Math.max(
    0,
    Math.floor((startOfDay(now).getTime() - startOfDay(lastTendedAt).getTime()) / MS_PER_DAY),
  );

  return formatRelativeFromDays(days);
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

export function formatEventDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function heroAttentionCopy(
  name: string,
  status: "getting_stale" | "needs_attention",
): string {
  if (status === "needs_attention") {
    return `${name} could use attention`;
  }

  return `${name} is getting stale`;
}
