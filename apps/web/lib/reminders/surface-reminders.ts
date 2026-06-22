export const REMINDER_BANNER_MAX_ITEMS = 3;

interface ReminderBannerCandidate {
  itemId: string;
  name: string;
  type: "must" | "want";
  status: "fresh" | "getting_stale" | "needs_attention";
  daysSinceLastTended: number | null;
}

function urgencyDays(reminder: ReminderBannerCandidate): number {
  return reminder.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
}

export function selectReminderBannerItems<T extends ReminderBannerCandidate>(
  reminders: T[],
  max = REMINDER_BANNER_MAX_ITEMS,
): T[] {
  return reminders
    .filter((reminder) => reminder.type === "must" && reminder.status === "needs_attention")
    .sort((left, right) => {
      const daysDiff = urgencyDays(right) - urgencyDays(left);
      if (daysDiff !== 0) {
        return daysDiff;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, max);
}

export function reminderItemIdsKey(reminders: Array<{ itemId: string }>): string {
  return reminders
    .map((reminder) => reminder.itemId)
    .sort()
    .join("\0");
}
