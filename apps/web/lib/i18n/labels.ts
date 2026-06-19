import type { TranslationKey } from "@/lib/i18n/dictionaries";
import type { LifeArea } from "@tend/domain";

export const LIFE_AREA_TRANSLATION_KEYS: Record<LifeArea, TranslationKey> = {
  finance: "lifeArea.finance",
  food_kitchen: "lifeArea.foodKitchen",
  health: "lifeArea.health",
  home_maintenance: "lifeArea.homeMaintenance",
  household: "lifeArea.household",
  kids_family: "lifeArea.kidsFamily",
  life_admin: "lifeArea.lifeAdmin",
  outdoor: "lifeArea.outdoor",
  personal: "lifeArea.personal",
  pets: "lifeArea.pets",
  relationships: "lifeArea.relationships",
  self_care: "lifeArea.selfCare",
  vehicle: "lifeArea.vehicle",
};

export const RHYTHM_TRANSLATION_KEYS: Record<number, TranslationKey> = {
  1: "items.add.rhythm.daily",
  7: "items.add.rhythm.weekly",
  14: "items.add.rhythm.everyTwoWeeks",
  30: "items.add.rhythm.monthly",
};

export const WEEKDAY_TRANSLATION_KEYS: Record<number, TranslationKey> = {
  0: "availability.day.sunday",
  1: "availability.day.monday",
  2: "availability.day.tuesday",
  3: "availability.day.wednesday",
  4: "availability.day.thursday",
  5: "availability.day.friday",
  6: "availability.day.saturday",
};
