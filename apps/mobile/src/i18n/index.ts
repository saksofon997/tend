import { LIFE_AREA_LABELS } from "@/constants";
import { en } from "@/i18n/en";
import type { LifeArea } from "@tend/domain";

type TranslationKey = keyof typeof en;

export function t(key: TranslationKey, params: Record<string, string | number> = {}) {
  let value = en[key];

  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replace(`{{${paramKey}}}`, String(paramValue)) as typeof value;
  }

  return value;
}

export function lifeAreaFilterToggleLabel(selected: LifeArea | null): string {
  if (selected === null) {
    return t("filter.byArea.prompt");
  }

  return t("filter.byArea.selected", { area: LIFE_AREA_LABELS[selected] });
}
