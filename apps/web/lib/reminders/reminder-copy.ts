import type { Locale } from "@/lib/i18n/dictionaries";
import type { ReminderEmphasis, TendItemType, TendStatus } from "@tend/domain";

export interface ReminderCopyInput {
  name: string;
  type: TendItemType;
  status: TendStatus;
  daysSinceLastTended: number | null;
  emphasis: ReminderEmphasis;
}

export function freeTimePhrase(now: Date, locale: Locale = "en"): string {
  const hour = now.getHours();

  if (hour < 12) {
    return locale === "sr" ? "ovog jutra" : "this morning";
  }

  if (hour < 17) {
    return locale === "sr" ? "ovog popodneva" : "this afternoon";
  }

  return locale === "sr" ? "ove večeri" : "this evening";
}

type FreeTimeHeadlineBuilder = (timePhrase: string, plural: boolean) => string;

const FREE_TIME_HEADLINE_VARIANTS: Record<Locale, FreeTimeHeadlineBuilder[]> = {
  en: [
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
  ],
  sr: [
    (_timePhrase, plural) =>
      plural ? "Ako ti prija, tenduj ove stavke:" : "Ako ti prija, tenduj ovo:",
    (timePhrase) => `Miran trenutak ${timePhrase}. Pogledaj šta traži pažnju:`,
    (_timePhrase, plural) =>
      plural
        ? "Kad imaš trenutak, ove stavke mogu da se tenduju:"
        : "Kad imaš trenutak, ovo može da se tenduje:",
    (timePhrase, plural) =>
      plural
        ? `Ako imaš slobodan trenutak ${timePhrase}, ove stavke mogu da se pogledaju:`
        : `Ako imaš slobodan trenutak ${timePhrase}, ovo može da se pogleda:`,
  ],
};

export function pickFreeTimeHeadlineVariantIndex(now: Date, variantCount: number): number {
  const dayNumber = Math.floor(now.getTime() / 86_400_000);
  return ((dayNumber % variantCount) + variantCount) % variantCount;
}

export function buildFreeTimeReminderHeadline(
  now: Date,
  reminderCount: number,
  locale: Locale = "en",
): string {
  const variants = FREE_TIME_HEADLINE_VARIANTS[locale];
  const variantIndex = pickFreeTimeHeadlineVariantIndex(now, variants.length);
  const plural = reminderCount > 1;
  return variants[variantIndex](freeTimePhrase(now, locale), plural);
}

export function buildReminderCopy(reminder: ReminderCopyInput, locale: Locale = "en"): string {
  if (locale === "sr") {
    if (reminder.type === "must" && reminder.status === "needs_attention") {
      return `${reminder.name} je označeno kao must i traži pažnju.`;
    }

    const days = reminder.daysSinceLastTended;

    if (days === null) {
      return `${reminder.name} još nije tendovano.`;
    }

    if (days === 0) {
      return `${reminder.name} je tendovano danas, ali i dalje može da traži pažnju.`;
    }

    if (days === 1) {
      return `${reminder.name} je poslednji put tendovano juče.`;
    }

    return `${reminder.name} je poslednji put tendovano pre ${days} dana.`;
  }

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

export function buildAggregatedReminderCopy(
  reminders: ReminderCopyInput[],
  now: Date,
  locale: Locale = "en",
): string {
  if (reminders.length === 0) {
    return "";
  }

  return buildFreeTimeReminderHeadline(now, reminders.length, locale);
}
