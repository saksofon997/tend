import {
  calendarDateParts,
  calendarDatesInclusive,
  formatCalendarDate,
  isCalendarDate,
  shiftCalendarDate,
} from "./time";

export const REFLECTION_BODY_MAX_LENGTH = 1000;
export const REFLECTION_NOTEBOOK_LOOKBACK_DAYS = 29;

export interface ReflectionEntry {
  id: string;
  entryDate: string;
  body: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function normalizeReflectionBody(body: string): string {
  return body.replace(/\r\n/g, "\n");
}

export function isReflectionBodyWithinLimit(body: string): boolean {
  return normalizeReflectionBody(body).length <= REFLECTION_BODY_MAX_LENGTH;
}

export function previewReflectionBody(body: string, maxLength = 72): string {
  const trimmed = normalizeReflectionBody(body).trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function monthGridDates(year: number, month: number): Array<string | null> {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const weekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = Array.from({ length: weekday }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatCalendarDate(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function notebookDates({
  today,
  entryDates,
  selectedDate,
  lookbackDays = REFLECTION_NOTEBOOK_LOOKBACK_DAYS,
}: {
  today: string;
  entryDates: string[];
  selectedDate: string;
  lookbackDays?: number;
}): string[] {
  const dates = new Set<string>();
  const windowStart = shiftCalendarDate(today, -lookbackDays);

  for (const date of calendarDatesInclusive(windowStart, today)) {
    dates.add(date);
  }

  for (const date of entryDates) {
    if (isCalendarDate(date)) {
      dates.add(date);
    }
  }

  if (isCalendarDate(selectedDate)) {
    dates.add(selectedDate);
  }

  return [...dates].sort();
}

export function reflectionMonthLabelParts(entryDate: string): { year: number; month: number } {
  const { year, month } = calendarDateParts(entryDate);
  return { year, month };
}
