import { calendarDateString, isCalendarDate } from "@tend/domain";

export function localDateFromCalendarDate(value: string): Date {
  if (!isCalendarDate(value)) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function calendarDateFromLocalDate(date: Date): string {
  return calendarDateString(date);
}

export function calendarDisabledMatchers(
  min?: string,
  max?: string,
): Array<{ before: Date } | { after: Date }> {
  const matchers: Array<{ before: Date } | { after: Date }> = [];

  if (min && isCalendarDate(min)) {
    matchers.push({ before: localDateFromCalendarDate(min) });
  }

  if (max && isCalendarDate(max)) {
    matchers.push({ after: localDateFromCalendarDate(max) });
  }

  return matchers;
}
