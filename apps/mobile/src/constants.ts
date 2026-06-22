import type { LifeArea } from "@tend/domain";

export const ITEM_NAME_MAX_LENGTH = 200;
export const RHYTHM_MIN_DAYS = 1;
export const RHYTHM_MAX_DAYS = 365;
export const REMINDER_POLL_MS = 5 * 60 * 1000;

export const LIFE_AREA_ORDER: Array<Exclude<LifeArea, "personal">> = [
  "household",
  "food_kitchen",
  "home_maintenance",
  "outdoor",
  "health",
  "self_care",
  "relationships",
  "kids_family",
  "pets",
  "vehicle",
  "finance",
  "life_admin",
];

export const LIFE_AREA_LABELS: Record<LifeArea, string> = {
  household: "Household",
  health: "Health",
  relationships: "Relationships",
  pets: "Pets",
  vehicle: "Vehicle",
  life_admin: "Life admin",
  self_care: "Self-care",
  finance: "Finance",
  food_kitchen: "Food & kitchen",
  home_maintenance: "Home maintenance",
  outdoor: "Outdoor",
  kids_family: "Kids & family",
  personal: "Personal",
};

export const RHYTHM_OPTIONS = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Every 2 weeks", days: 14 },
  { label: "Monthly", days: 30 },
] as const;

export type RhythmOption = { label: string; days: number };

export function isPresetRhythm(
  days: number,
  options: readonly RhythmOption[] = RHYTHM_OPTIONS,
): boolean {
  return options.some((option) => option.days === days);
}

export const WEEKDAYS = [
  "availability.day.sunday",
  "availability.day.monday",
  "availability.day.tuesday",
  "availability.day.wednesday",
  "availability.day.thursday",
  "availability.day.friday",
  "availability.day.saturday",
] as const;

export function todayDateInputValue(from = new Date()) {
  const year = from.getFullYear();
  const month = String(from.getMonth() + 1).padStart(2, "0");
  const day = String(from.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateInputToIso(dateValue: string) {
  return `${dateValue}T12:00:00.000Z`;
}

export function isoToDateInputValue(iso: string | null | undefined) {
  if (!iso) {
    return todayDateInputValue();
  }

  return todayDateInputValue(new Date(iso));
}
