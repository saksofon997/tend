import { findNextAvailabilityWindow, isInAvailabilityWindow } from "./availability";
import { computeStatus, daysSinceLastTended } from "./status";
import type {
  AvailabilityWindow,
  EligibleReminder,
  ReminderResult,
  TendItemInput,
  TendStatus,
} from "./types";

const REMINDER_STATUSES = new Set<TendStatus>(["getting_stale", "needs_attention"]);

function isReminderEligible(status: TendStatus): boolean {
  return REMINDER_STATUSES.has(status);
}

function buildReminder(
  item: TendItemInput,
  status: TendStatus,
  now: Date,
  visibility: EligibleReminder["visibility"],
): EligibleReminder {
  return {
    item,
    status,
    daysSinceLastTended: daysSinceLastTended(item.lastTendedAt, now),
    emphasis: item.type === "must" ? "strong" : "normal",
    visibility,
  };
}

export function eligibleReminders(
  items: TendItemInput[],
  availability: AvailabilityWindow[],
  now: Date,
): ReminderResult {
  const inWindow = isInAvailabilityWindow(availability, now);
  const nextWindowAt = inWindow ? null : findNextAvailabilityWindow(availability, now);

  const reminders = items
    .filter((item) => !item.archivedAt)
    .map((item) => {
      const status = computeStatus({
        lastTendedAt: item.lastTendedAt,
        rhythmDays: item.rhythmDays,
        now,
      });

      if (!isReminderEligible(status)) {
        return null;
      }

      if (item.type === "must") {
        return buildReminder(item, status, now, "now");
      }

      if (availability.length === 0) {
        return buildReminder(item, status, now, "now");
      }

      return buildReminder(item, status, now, inWindow ? "now" : "next_window");
    })
    .filter((reminder): reminder is EligibleReminder => reminder !== null)
    .sort((left, right) => {
      if (left.visibility !== right.visibility) {
        return left.visibility === "now" ? -1 : 1;
      }

      if (left.emphasis !== right.emphasis) {
        return left.emphasis === "strong" ? -1 : 1;
      }

      const statusDiff = left.status === "needs_attention" ? -1 : 1;
      if (left.status !== right.status) {
        return left.status === "needs_attention" ? -1 : 1;
      }

      const leftDays = left.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
      const rightDays = right.daysSinceLastTended ?? Number.MAX_SAFE_INTEGER;
      return rightDays - leftDays;
    });

  return {
    reminders,
    nextWindowAt,
    inAvailabilityWindow: inWindow,
  };
}

export function remindersToSurfaceNow(result: ReminderResult): EligibleReminder[] {
  return result.reminders.filter((reminder) => reminder.visibility === "now");
}
