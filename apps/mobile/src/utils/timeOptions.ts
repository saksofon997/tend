import { parseTimeToMinutes } from "@tend/domain";

export const TIME_OPTION_INTERVAL_MINUTES = 30;

export function formatTimeMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildTimeOptions(intervalMinutes = TIME_OPTION_INTERVAL_MINUTES): string[] {
  const options: string[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += intervalMinutes) {
    options.push(formatTimeMinutes(minutes));
  }

  return options;
}

export const TIME_OPTIONS = buildTimeOptions();

export function isValidTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function normalizeTimeValue(value: string, fallback = "18:00"): string {
  const trimmed = value.trim();
  return isValidTimeValue(trimmed) ? trimmed : fallback;
}

export function timeOptionsIncluding(value: string, baseOptions = TIME_OPTIONS): string[] {
  const normalized = normalizeTimeValue(value, "");

  if (!normalized || baseOptions.includes(normalized)) {
    return baseOptions;
  }

  return [...baseOptions, normalized].sort();
}

export function timeOptionsAfter(afterTime: string, baseOptions = TIME_OPTIONS): string[] {
  let afterMinutes: number;

  try {
    afterMinutes = parseTimeToMinutes(afterTime);
  } catch {
    return baseOptions;
  }

  return baseOptions.filter((time) => parseTimeToMinutes(time) > afterMinutes);
}
