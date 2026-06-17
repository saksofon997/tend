import type { TendItemRow } from "@tend/db";
import type { EligibleReminder, ReminderResult } from "@tend/domain";
import type { TendItemType, TendStatus } from "@tend/domain";
import { buildReminderCopy } from "./reminder-copy";

export interface ReminderResponse {
  itemId: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  daysSinceLastTended: number | null;
  emphasis: EligibleReminder["emphasis"];
  visibility: EligibleReminder["visibility"];
  copy: string;
}

export interface RemindersApiResponse {
  reminders: ReminderResponse[];
  surfaceNow: ReminderResponse[];
  nextWindowAt: string | null;
  inAvailabilityWindow: boolean;
}

export function toTendItemInput(item: TendItemRow) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    rhythmDays: item.rhythmDays,
    lastTendedAt: item.lastTendedAt,
    lifeArea: item.lifeArea,
    archivedAt: item.archivedAt,
  };
}

export function serializeReminder(reminder: EligibleReminder): ReminderResponse {
  return {
    itemId: reminder.item.id,
    name: reminder.item.name,
    type: reminder.item.type,
    status: reminder.status,
    daysSinceLastTended: reminder.daysSinceLastTended,
    emphasis: reminder.emphasis,
    visibility: reminder.visibility,
    copy: buildReminderCopy({
      name: reminder.item.name,
      type: reminder.item.type,
      status: reminder.status,
      daysSinceLastTended: reminder.daysSinceLastTended,
      emphasis: reminder.emphasis,
    }),
  };
}

export function serializeReminderResult(
  result: ReminderResult,
  toInstant: (date: Date) => Date = (date) => date,
): RemindersApiResponse {
  const reminders = result.reminders.map((reminder) => serializeReminder(reminder));
  const surfaceNow = reminders.filter((reminder) => reminder.visibility === "now");

  return {
    reminders,
    surfaceNow,
    nextWindowAt: result.nextWindowAt ? toInstant(result.nextWindowAt).toISOString() : null,
    inAvailabilityWindow: result.inAvailabilityWindow,
  };
}
