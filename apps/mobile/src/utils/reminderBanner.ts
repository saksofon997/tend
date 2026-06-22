import type { ReminderResponse } from "@/types";

export const REMINDER_BANNER_MAX_ITEMS = 3;

function urgencyDays(reminder: ReminderResponse): number {
  return reminder.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
}

export function selectReminderBannerItems(
  reminders: ReminderResponse[],
  max = REMINDER_BANNER_MAX_ITEMS,
): ReminderResponse[] {
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
