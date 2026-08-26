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

export function isSameLocalYearMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

/** Keep the existing Date when DayPicker reports the same visible month. */
export function retainMonthIfUnchanged(current: Date, next: Date): Date {
  return isSameLocalYearMonth(current, next) ? current : next;
}

export function visibleMonthFromLocalDate(date: Date): { year: number; month: number } {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function nextVisibleMonth(
  current: { year: number; month: number },
  nextDate: Date,
): { year: number; month: number } | null {
  const next = visibleMonthFromLocalDate(nextDate);
  if (next.year === current.year && next.month === current.month) {
    return null;
  }
  return next;
}
