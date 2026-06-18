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
