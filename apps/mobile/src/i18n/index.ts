import { en } from "@/i18n/en";
import { sr } from "@/i18n/sr";
import type { LifeArea } from "@tend/domain";

type TranslationKey = keyof typeof en;
export type Locale = "en" | "sr";

export const LOCALE_STORAGE_KEY = "tend.locale";

export const LOCALE_OPTIONS: Array<{ value: Locale; labelKey: TranslationKey }> = [
  { value: "en", labelKey: "language.english" },
  { value: "sr", labelKey: "language.serbian" },
];

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  sr,
};

const LIFE_AREA_KEYS: Record<LifeArea, TranslationKey> = {
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

let currentLocale: Locale = "en";

export function getLocale(): Locale {
  return currentLocale;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "sr";
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t(key: TranslationKey, params: Record<string, string | number> = {}) {
  let value = DICTIONARIES[currentLocale][key] ?? en[key];

  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replace(`{{${paramKey}}}`, String(paramValue)) as typeof value;
  }

  return value;
}

export function lifeAreaLabel(area: LifeArea): string {
  return t(LIFE_AREA_KEYS[area]);
}

export function lifeAreaFilterToggleLabel(selected: LifeArea | null): string {
  if (selected === null) {
    return t("filter.byArea.prompt");
  }

  return t("filter.byArea.selected", { area: lifeAreaLabel(selected) });
}
