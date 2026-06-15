import type { LifeArea } from "@tend/domain";

export const LIFE_AREA_ORDER: Array<Exclude<LifeArea, "personal">> = [
  "household",
  "health",
  "relationships",
  "pets",
  "vehicle",
  "admin",
];

export const LIFE_AREA_LABELS: Record<LifeArea, string> = {
  household: "Household",
  health: "Health",
  relationships: "Relationships",
  pets: "Pets",
  vehicle: "Vehicle",
  admin: "Admin",
  personal: "Personal",
};

export const RHYTHM_OPTIONS = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Every 2 weeks", days: 14 },
  { label: "Monthly", days: 30 },
] as const;

export function todayDateInputValue(from: Date = new Date()): string {
  return from.toISOString().slice(0, 10);
}

export function dateInputToIso(dateValue: string): string {
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

export function isoToDateInputValue(iso: string | null | undefined, fallback?: string): string {
  if (iso) {
    return iso.slice(0, 10);
  }

  return fallback ?? todayDateInputValue();
}
