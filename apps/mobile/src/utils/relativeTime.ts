import { t } from "@i18n";

export function formatRelativeFromDays(daysSince: number | null): string {
  if (daysSince === null) {
    return t("relative.lastTendedNever");
  }

  if (daysSince === 0) {
    return t("relative.lastTendedToday");
  }

  if (daysSince === 1) {
    return t("relative.lastTendedYesterday");
  }

  return t("relative.lastTendedDaysAgo", { days: daysSince });
}
