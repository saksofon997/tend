export const REMINDER_BANNER_MAX_ITEMS = 3;

/** Fisher–Yates partial shuffle; picks up to `max` items without mutating the input. */
export function pickReminderBannerItems<T>(reminders: T[], max = REMINDER_BANNER_MAX_ITEMS): T[] {
  if (reminders.length <= max) {
    return reminders;
  }

  const picked = [...reminders];

  for (let i = 0; i < max; i++) {
    const j = i + Math.floor(Math.random() * (picked.length - i));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked.slice(0, max);
}

export function reminderItemIdsKey(reminders: Array<{ itemId: string }>): string {
  return reminders
    .map((reminder) => reminder.itemId)
    .sort()
    .join("\0");
}
