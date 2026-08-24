import type { ReminderResponse, RemindersApiResponse } from "@/lib/reminders/serialize";
import type { PushSubscriptionRow } from "@tend/db";
import { type AvailabilityWindow, wasNotifiedInCurrentAvailabilityWindow } from "@tend/domain";

export const REMINDER_NOTIFICATION_THROTTLE_MS = 23 * 60 * 60 * 1000;

export interface ReminderNotificationThrottleContext {
  windows: AvailabilityWindow[];
  localNow: Date;
  lastNotifiedAtLocal: Date | null;
}

export interface TendNotificationRequest {
  title: string;
  body: string;
  itemId: string | null;
  triggerAt: Date | null;
  kind?: "weekly_support";
}

function reminderBody(reminder: ReminderResponse): string {
  if (reminder.type === "must") {
    return "Marked as a must, so Tend keeps it easy to see.";
  }

  if (reminder.status === "needs_attention") {
    return "Past its usual rhythm. Take a look when there is room.";
  }

  if (reminder.status === "getting_stale") {
    return "Starting to drift from its rhythm, with no rush attached.";
  }

  return "A quiet reminder for your next open moment.";
}

function pickPriorityReminder(reminders: ReminderResponse[]): ReminderResponse | undefined {
  const ranked = reminders
    .map((reminder) => ({ reminder, rank: notificationRank(reminder) }))
    .filter((entry): entry is { reminder: ReminderResponse; rank: number } => entry.rank !== null);

  if (ranked.length === 0) {
    return undefined;
  }

  ranked.sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    const leftDays = left.reminder.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
    const rightDays = right.reminder.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
    return rightDays - leftDays;
  });

  return ranked[0]?.reminder;
}

/** Only these three combinations notify. Anything else, including getting-stale wants, is silent. */
function notificationRank(reminder: ReminderResponse): number | null {
  if (reminder.type === "must" && reminder.status === "needs_attention") {
    return 0;
  }
  if (reminder.type === "must" && reminder.status === "getting_stale") {
    return 1;
  }
  if (reminder.type === "want" && reminder.status === "needs_attention") {
    return 2;
  }
  return null;
}

export function buildTendNotificationRequest(
  reminders: RemindersApiResponse,
): TendNotificationRequest | null {
  if (!reminders.inAvailabilityWindow && reminders.nextWindowAt) {
    const deferredReminder = pickPriorityReminder(reminders.reminders);
    if (!deferredReminder) {
      return null;
    }

    return {
      title: `${deferredReminder.name} could use tending`,
      body: reminderBody(deferredReminder),
      itemId: deferredReminder.itemId,
      triggerAt: new Date(reminders.nextWindowAt),
    };
  }

  const immediateReminder = pickPriorityReminder(reminders.surfaceNow);
  if (immediateReminder) {
    return {
      title: `${immediateReminder.name} could use tending`,
      body: reminderBody(immediateReminder),
      itemId: immediateReminder.itemId,
      triggerAt: null,
    };
  }

  if (!reminders.nextWindowAt) {
    return null;
  }

  const deferredReminder = pickPriorityReminder(reminders.reminders);
  if (!deferredReminder) {
    return null;
  }

  return {
    title: `${deferredReminder.name} could use tending`,
    body: reminderBody(deferredReminder),
    itemId: deferredReminder.itemId,
    triggerAt: new Date(reminders.nextWindowAt),
  };
}

export function isNotificationDue(request: TendNotificationRequest, now: Date): boolean {
  return !request.triggerAt || request.triggerAt <= now;
}

export function latestNotificationAt(...values: Array<Date | null | undefined>): Date | null {
  const dates = values.filter((value): value is Date => value instanceof Date);
  if (dates.length === 0) {
    return null;
  }

  return dates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

export function shouldSendReminderNotification(
  subscription: Pick<PushSubscriptionRow, "lastNotifiedAt" | "lastNotifiedItemId">,
  request: TendNotificationRequest,
  now: Date,
  context: ReminderNotificationThrottleContext = {
    windows: [],
    localNow: now,
    lastNotifiedAtLocal: subscription.lastNotifiedAt,
  },
): boolean {
  if (request.kind !== "weekly_support" && !isNotificationDue(request, now)) {
    return false;
  }

  if (
    wasNotifiedInCurrentAvailabilityWindow(
      context.windows,
      context.lastNotifiedAtLocal,
      context.localNow,
    )
  ) {
    return false;
  }

  if (context.windows.length > 0) {
    return true;
  }

  if (
    subscription.lastNotifiedAt &&
    now.getTime() - subscription.lastNotifiedAt.getTime() < REMINDER_NOTIFICATION_THROTTLE_MS
  ) {
    return false;
  }

  return true;
}
