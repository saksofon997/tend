import { RHYTHM_MAX_DAYS, RHYTHM_MIN_DAYS } from "@/constants";

export const RHYTHM_CUSTOM_SELECT_VALUE = "custom";

export function rhythmDaysFieldError(days: number): string | null {
  if (!Number.isInteger(days)) {
    return "Use a whole number of days";
  }

  if (days < RHYTHM_MIN_DAYS) {
    return "Rhythm must be at least 1 day";
  }

  if (days > RHYTHM_MAX_DAYS) {
    return "Rhythm must be 365 days or fewer";
  }

  return null;
}
