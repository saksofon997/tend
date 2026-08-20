import { MS_PER_DAY, localDateInTimeZone } from "./time";

export const WEEKLY_SUPPORT_LOOKBACK_DAYS = 7;
export const WEEKLY_SUPPORT_MIN_INTERVAL_MS = 6.5 * MS_PER_DAY;
export const WEEKLY_SUPPORT_LOCAL_START_HOUR = 9;
export const WEEKLY_SUPPORT_LOCAL_END_HOUR = 21;

export type WeeklySupportTone = "quiet" | "present" | "steady";

export interface WeeklySupportCopy {
  title: string;
  body: string;
}

const WEEKLY_SUPPORT_COPY: Record<WeeklySupportTone, WeeklySupportCopy> = {
  quiet: {
    title: "A small week is still a week",
    body: "Nothing needed tending, and that is allowed. One quiet tend is enough whenever there is room.",
  },
  present: {
    title: "Care found a few moments",
    body: "A little tending happened this week. That is plenty. Tend will keep the rest light.",
  },
  steady: {
    title: "You came back to a few things",
    body: "Care showed up more than once this week. Keep the pace that feels kind.",
  },
};

/** Supportive weekly note, not a score. Thresholds stay qualitative. */
export function weeklySupportTone(tendCount: number): WeeklySupportTone {
  if (tendCount <= 0) {
    return "quiet";
  }

  if (tendCount <= 3) {
    return "present";
  }

  return "steady";
}

export function weeklySupportCopy(tendCount: number): WeeklySupportCopy {
  return WEEKLY_SUPPORT_COPY[weeklySupportTone(tendCount)];
}

export function weeklySupportLookbackStart(now: Date): Date {
  return new Date(now.getTime() - WEEKLY_SUPPORT_LOOKBACK_DAYS * MS_PER_DAY);
}

export function isWeeklySupportDue(
  now: Date,
  timeZone: string,
  lastWeeklySupportAt: Date | null,
  firstEligibleAt: Date,
): boolean {
  const localNow = localDateInTimeZone(now, timeZone);
  if (
    localNow.getHours() < WEEKLY_SUPPORT_LOCAL_START_HOUR ||
    localNow.getHours() >= WEEKLY_SUPPORT_LOCAL_END_HOUR
  ) {
    return false;
  }

  const earliest = lastWeeklySupportAt ?? firstEligibleAt;
  return now.getTime() - earliest.getTime() >= WEEKLY_SUPPORT_MIN_INTERVAL_MS;
}
