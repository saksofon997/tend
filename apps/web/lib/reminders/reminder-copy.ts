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

type FreeTimeHeadlineBuilder = (timePhrase: string, plural: boolean) => string;

const FREE_TIME_HEADLINE_VARIANTS: FreeTimeHeadlineBuilder[] = [
  (_timePhrase, plural) =>
    plural
      ? "If you're up for it, why not tend to these:"
      : "If you're up for it, why not tend to this:",
  (timePhrase) => `A quiet moment ${timePhrase}. Take a look at what needs attention:`,
  (_timePhrase, plural) =>
    plural
      ? "When you have a moment, these could use tending:"
      : "When you have a moment, this could use tending:",
  (timePhrase, plural) =>
    plural
      ? `If you have a spare moment ${timePhrase}, these could use a look:`
      : `If you have a spare moment ${timePhrase}, this could use a look:`,
];

export function pickFreeTimeHeadlineVariantIndex(now: Date, variantCount: number): number {
  const dayNumber = Math.floor(now.getTime() / 86_400_000);
  return ((dayNumber % variantCount) + variantCount) % variantCount;
}

export function buildFreeTimeReminderHeadline(now: Date, reminderCount: number): string {
  const variantIndex = pickFreeTimeHeadlineVariantIndex(now, FREE_TIME_HEADLINE_VARIANTS.length);
  const plural = reminderCount > 1;
  return FREE_TIME_HEADLINE_VARIANTS[variantIndex](freeTimePhrase(now), plural);
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

  return buildFreeTimeReminderHeadline(now, reminders.length);
}
