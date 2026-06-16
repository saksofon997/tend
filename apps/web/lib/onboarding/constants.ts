import type { LifeArea } from "@tend/domain";

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

export const RHYTHM_MIN_DAYS = 1;
export const RHYTHM_MAX_DAYS = 365;

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

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateInputValue(from: Date = new Date()): string {
  return toLocalDateString(from);
}

/** Store calendar dates at UTC noon so the date portion is stable across timezones. */
export function dateInputToIso(dateValue: string): string {
  return `${dateValue}T12:00:00.000Z`;
}

export function isoToDateInputValue(iso: string | null | undefined, fallback?: string): string {
  if (iso) {
    return toLocalDateString(new Date(iso));
  }

  return fallback ?? todayDateInputValue();
}
