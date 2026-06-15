import type { LifeArea, TendPreset } from "./types";

const household: TendPreset[] = [
  { name: "Change bed sheets", type: "want", rhythmDays: 14, lifeArea: "household" },
  { name: "Vacuum", type: "want", rhythmDays: 7, lifeArea: "household" },
  { name: "Clean bathroom", type: "want", rhythmDays: 7, lifeArea: "household" },
  { name: "Clean AC filter", type: "want", rhythmDays: 90, lifeArea: "household" },
];

const health: TendPreset[] = [
  { name: "Stretch", type: "want", rhythmDays: 1, lifeArea: "health" },
  { name: "Long walk", type: "want", rhythmDays: 7, lifeArea: "health" },
  { name: "Dental cleaning", type: "must", rhythmDays: 180, lifeArea: "health" },
  { name: "Check blood pressure", type: "want", rhythmDays: 30, lifeArea: "health" },
];

const relationships: TendPreset[] = [
  { name: "Dinner with partner", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Movie night", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Call parents", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Meet a friend", type: "want", rhythmDays: 30, lifeArea: "relationships" },
];

const pets: TendPreset[] = [
  { name: "Clean litter box", type: "must", rhythmDays: 1, lifeArea: "pets" },
  { name: "Buy pet food", type: "want", rhythmDays: 14, lifeArea: "pets" },
  { name: "Grooming", type: "want", rhythmDays: 30, lifeArea: "pets" },
];

const vehicle: TendPreset[] = [
  { name: "Check tire pressure", type: "want", rhythmDays: 30, lifeArea: "vehicle" },
  { name: "Oil change", type: "must", rhythmDays: 90, lifeArea: "vehicle" },
  { name: "Car wash", type: "want", rhythmDays: 30, lifeArea: "vehicle" },
];

const admin: TendPreset[] = [
  { name: "Pay bills", type: "must", rhythmDays: 30, lifeArea: "admin" },
  { name: "Renew insurance", type: "must", rhythmDays: 365, lifeArea: "admin" },
  { name: "Back up photos", type: "want", rhythmDays: 30, lifeArea: "admin" },
];

export const PRESETS_BY_AREA: Record<Exclude<LifeArea, "personal">, TendPreset[]> = {
  household,
  health,
  relationships,
  pets,
  vehicle,
  admin,
};

export const ALL_PRESETS: TendPreset[] = Object.values(PRESETS_BY_AREA).flat();

export function getPresetsByArea(lifeArea: LifeArea): TendPreset[] {
  if (lifeArea === "personal") {
    return [];
  }

  return PRESETS_BY_AREA[lifeArea];
}
