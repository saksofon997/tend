export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real YYYY-MM-DD calendar day, not a locale-typed or impossible date. */
export function isCalendarDate(value: string): boolean {
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function daysBetween(earlier: Date, later: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

export function calendarDaysBetween(earlier: Date, later: Date): number {
  const [ey, em, ed] = earlier.toISOString().slice(0, 10).split("-").map(Number);
  const [ly, lm, ld] = later.toISOString().slice(0, 10).split("-").map(Number);

  return Math.floor((Date.UTC(ly, lm - 1, ld) - Date.UTC(ey, em - 1, ed)) / MS_PER_DAY);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return hours * 60 + minutes;
}

export function dateAtTime(base: Date, minutesFromMidnight: number): Date {
  const result = new Date(base);
  result.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0);
  return result;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = new Map(parts.map((part) => [part.type, Number(part.value)]));
  const hour = values.get("hour") ?? 0;

  return {
    year: values.get("year") ?? date.getUTCFullYear(),
    month: values.get("month") ?? date.getUTCMonth() + 1,
    day: values.get("day") ?? date.getUTCDate(),
    hour: hour === 24 ? 0 : hour,
    minute: values.get("minute") ?? 0,
    second: values.get("second") ?? 0,
  };
}

export function localDateInTimeZone(date: Date, timeZone: string): Date {
  const parts = zonedParts(date, timeZone);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return zonedAsUtc - date.getTime();
}

export function zonedLocalDateToInstant(date: Date, timeZone: string): Date {
  const utcGuess = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
  const firstPass = utcGuess - timeZoneOffsetMs(new Date(utcGuess), timeZone);
  const secondPass = utcGuess - timeZoneOffsetMs(new Date(firstPass), timeZone);

  return new Date(secondPass);
}
