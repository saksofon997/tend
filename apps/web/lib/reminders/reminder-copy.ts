import type { ReminderEmphasis, TendItemType, TendStatus } from "@tend/domain";

export interface ReminderCopyInput {
  name: string;
  type: TendItemType;
  status: TendStatus;
  daysSinceLastTended: number | null;
  emphasis: ReminderEmphasis;
}

export function freeTimePhrase(now: Date): string {
  const hour = now.getHours();

  if (hour < 12) {
    return "this morning";
  }

  if (hour < 17) {
    return "this afternoon";
  }

  return "this evening";
}

export function buildReminderCopy(reminder: ReminderCopyInput): string {
  if (reminder.type === "must" && reminder.status === "needs_attention") {
    return `${reminder.name} is marked as a must and needs attention.`;
  }

  const days = reminder.daysSinceLastTended;

  if (days === null) {
    return `${reminder.name} has never been tended.`;
  }

  if (days === 0) {
    return `${reminder.name} was tended today, but could still use attention.`;
  }

  if (days === 1) {
    return `${reminder.name} was last tended yesterday.`;
  }

  return `${reminder.name} was last tended ${days} days ago.`;
}

export function buildAggregatedReminderCopy(reminders: ReminderCopyInput[], now: Date): string {
  if (reminders.length === 0) {
    return "";
  }

  if (reminders.length === 1) {
    return buildReminderCopy(reminders[0]);
  }

  const names = reminders.map((reminder) => reminder.name);
  const last = names[names.length - 1];
  const rest = names.slice(0, -1);
  const nameList = rest.length > 0 ? `${rest.join(", ")} and ${last}` : last;

  return `You have free time ${freeTimePhrase(now)}. ${nameList} could use attention.`;
}
