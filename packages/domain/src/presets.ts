import type { LifeArea, TendPreset } from "./types";

const household: TendPreset[] = [
  { name: "Change bed sheets", type: "want", rhythmDays: 14, lifeArea: "household" },
  { name: "Vacuum", type: "want", rhythmDays: 7, lifeArea: "household" },
  { name: "Clean bathroom", type: "want", rhythmDays: 7, lifeArea: "household" },
  { name: "Clean AC filter", type: "want", rhythmDays: 90, lifeArea: "household" },
  { name: "Dust surfaces", type: "want", rhythmDays: 14, lifeArea: "household" },
  { name: "Do laundry", type: "want", rhythmDays: 7, lifeArea: "household" },
  { name: "Mop floors", type: "want", rhythmDays: 14, lifeArea: "household" },
  { name: "Take out trash and recycling", type: "want", rhythmDays: 7, lifeArea: "household" },
];

const health: TendPreset[] = [
  { name: "Stretch", type: "want", rhythmDays: 1, lifeArea: "health" },
  { name: "Long walk", type: "want", rhythmDays: 7, lifeArea: "health" },
  { name: "Dental cleaning", type: "must", rhythmDays: 180, lifeArea: "health" },
  { name: "Check blood pressure", type: "want", rhythmDays: 30, lifeArea: "health" },
  { name: "Annual physical", type: "must", rhythmDays: 365, lifeArea: "health" },
  { name: "Take medications", type: "must", rhythmDays: 1, lifeArea: "health" },
  { name: "Strength workout", type: "want", rhythmDays: 7, lifeArea: "health" },
  { name: "Eye exam", type: "must", rhythmDays: 365, lifeArea: "health" },
];

const relationships: TendPreset[] = [
  { name: "Dinner with partner", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Movie night", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Call parents", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Meet a friend", type: "want", rhythmDays: 30, lifeArea: "relationships" },
  { name: "Send a thoughtful message", type: "want", rhythmDays: 7, lifeArea: "relationships" },
  { name: "Plan a date night", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Check in with a sibling", type: "want", rhythmDays: 14, lifeArea: "relationships" },
  { name: "Write a thank-you note", type: "want", rhythmDays: 30, lifeArea: "relationships" },
];

const pets: TendPreset[] = [
  { name: "Clean litter box", type: "must", rhythmDays: 1, lifeArea: "pets" },
  { name: "Buy pet food", type: "want", rhythmDays: 14, lifeArea: "pets" },
  { name: "Grooming", type: "want", rhythmDays: 30, lifeArea: "pets" },
  { name: "Vet checkup", type: "must", rhythmDays: 365, lifeArea: "pets" },
  { name: "Walk the dog", type: "want", rhythmDays: 1, lifeArea: "pets" },
  { name: "Refill water bowl", type: "must", rhythmDays: 1, lifeArea: "pets" },
  { name: "Brush teeth or fur", type: "want", rhythmDays: 7, lifeArea: "pets" },
];

const vehicle: TendPreset[] = [
  { name: "Check tire pressure", type: "want", rhythmDays: 30, lifeArea: "vehicle" },
  { name: "Oil change", type: "must", rhythmDays: 90, lifeArea: "vehicle" },
  { name: "Car wash", type: "want", rhythmDays: 30, lifeArea: "vehicle" },
  { name: "Rotate tires", type: "must", rhythmDays: 180, lifeArea: "vehicle" },
  { name: "Replace wiper blades", type: "want", rhythmDays: 180, lifeArea: "vehicle" },
  { name: "Refill washer fluid", type: "want", rhythmDays: 90, lifeArea: "vehicle" },
  { name: "Renew registration", type: "must", rhythmDays: 365, lifeArea: "vehicle" },
];

const lifeAdmin: TendPreset[] = [
  { name: "Pay bills", type: "must", rhythmDays: 30, lifeArea: "life_admin" },
  { name: "Renew insurance", type: "must", rhythmDays: 365, lifeArea: "life_admin" },
  { name: "Back up photos", type: "want", rhythmDays: 30, lifeArea: "life_admin" },
  { name: "Review subscriptions", type: "want", rhythmDays: 30, lifeArea: "life_admin" },
  { name: "Update passwords", type: "want", rhythmDays: 90, lifeArea: "life_admin" },
  { name: "File important documents", type: "want", rhythmDays: 30, lifeArea: "life_admin" },
  { name: "Tax prep check-in", type: "must", rhythmDays: 90, lifeArea: "life_admin" },
];

const selfCare: TendPreset[] = [
  { name: "Rest day", type: "want", rhythmDays: 7, lifeArea: "self_care" },
  { name: "Journal", type: "want", rhythmDays: 7, lifeArea: "self_care" },
  { name: "Screen-free evening", type: "want", rhythmDays: 7, lifeArea: "self_care" },
  { name: "Meditate", type: "want", rhythmDays: 1, lifeArea: "self_care" },
  { name: "Skincare routine", type: "want", rhythmDays: 1, lifeArea: "self_care" },
  { name: "Read for pleasure", type: "want", rhythmDays: 7, lifeArea: "self_care" },
];

const finance: TendPreset[] = [
  { name: "Review budget", type: "want", rhythmDays: 30, lifeArea: "finance" },
  { name: "Reconcile accounts", type: "want", rhythmDays: 30, lifeArea: "finance" },
  { name: "Check credit score", type: "want", rhythmDays: 90, lifeArea: "finance" },
  { name: "Contribute to savings goal", type: "want", rhythmDays: 30, lifeArea: "finance" },
  { name: "Review credit card statements", type: "must", rhythmDays: 30, lifeArea: "finance" },
  { name: "Track spending", type: "want", rhythmDays: 7, lifeArea: "finance" },
];

const foodKitchen: TendPreset[] = [
  { name: "Deep-clean fridge", type: "want", rhythmDays: 30, lifeArea: "food_kitchen" },
  { name: "Meal prep", type: "want", rhythmDays: 7, lifeArea: "food_kitchen" },
  { name: "Pantry check", type: "want", rhythmDays: 14, lifeArea: "food_kitchen" },
  { name: "Clean oven", type: "want", rhythmDays: 90, lifeArea: "food_kitchen" },
  { name: "Restock staples", type: "want", rhythmDays: 14, lifeArea: "food_kitchen" },
  { name: "Run dishwasher", type: "want", rhythmDays: 1, lifeArea: "food_kitchen" },
  { name: "Wipe down counters", type: "want", rhythmDays: 1, lifeArea: "food_kitchen" },
];

const homeMaintenance: TendPreset[] = [
  { name: "Test smoke detectors", type: "must", rhythmDays: 90, lifeArea: "home_maintenance" },
  { name: "Service HVAC", type: "must", rhythmDays: 180, lifeArea: "home_maintenance" },
  { name: "Replace air filters", type: "must", rhythmDays: 90, lifeArea: "home_maintenance" },
  { name: "Check for leaks", type: "want", rhythmDays: 30, lifeArea: "home_maintenance" },
  { name: "Clean dryer vent", type: "must", rhythmDays: 180, lifeArea: "home_maintenance" },
  { name: "Inspect roof and gutters", type: "want", rhythmDays: 180, lifeArea: "home_maintenance" },
];

const outdoor: TendPreset[] = [
  { name: "Water plants", type: "want", rhythmDays: 7, lifeArea: "outdoor" },
  { name: "Mow lawn", type: "want", rhythmDays: 14, lifeArea: "outdoor" },
  { name: "Clear gutters", type: "must", rhythmDays: 180, lifeArea: "outdoor" },
  { name: "Trim hedges", type: "want", rhythmDays: 30, lifeArea: "outdoor" },
  { name: "Rake leaves", type: "want", rhythmDays: 30, lifeArea: "outdoor" },
  { name: "Sweep porch or patio", type: "want", rhythmDays: 14, lifeArea: "outdoor" },
];

const kidsFamily: TendPreset[] = [
  { name: "School forms", type: "must", rhythmDays: 30, lifeArea: "kids_family" },
  { name: "Pediatric checkup", type: "must", rhythmDays: 365, lifeArea: "kids_family" },
  { name: "Family game night", type: "want", rhythmDays: 14, lifeArea: "kids_family" },
  { name: "Pack lunches", type: "want", rhythmDays: 7, lifeArea: "kids_family" },
  { name: "Bedtime routine check-in", type: "want", rhythmDays: 1, lifeArea: "kids_family" },
  { name: "Plan weekend activity", type: "want", rhythmDays: 7, lifeArea: "kids_family" },
];

export const PRESETS_BY_AREA: Record<Exclude<LifeArea, "personal">, TendPreset[]> = {
  household,
  health,
  relationships,
  pets,
  vehicle,
  life_admin: lifeAdmin,
  self_care: selfCare,
  finance,
  food_kitchen: foodKitchen,
  home_maintenance: homeMaintenance,
  outdoor,
  kids_family: kidsFamily,
};

export const ALL_PRESETS: TendPreset[] = Object.values(PRESETS_BY_AREA).flat();

export function getPresetsByArea(lifeArea: LifeArea): TendPreset[] {
  if (lifeArea === "personal") {
    return [];
  }

  return PRESETS_BY_AREA[lifeArea];
}
