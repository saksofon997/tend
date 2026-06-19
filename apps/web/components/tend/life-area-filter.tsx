"use client";

import { LifeAreaChip } from "@/components/tend/life-area-chip";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { type TranslationKey, en } from "@/lib/i18n/dictionaries";
import { LIFE_AREA_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { LIFE_AREA_ORDER } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";
import type { LifeArea } from "@tend/domain";
import { useId, useState } from "react";

interface LifeAreaFilterProps {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  defaultOpen?: boolean;
}

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const defaultTranslate: Translate = (key, params = {}) => {
  let value = en[key];
  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replace(`{{${paramKey}}}`, String(paramValue)) as typeof value;
  }
  return value;
};

export function lifeAreaFilterToggleLabel(
  selected: LifeArea | null,
  t: Translate = defaultTranslate,
): string {
  if (selected === null) {
    return t("filter.byArea.prompt");
  }

  return t("filter.byArea.selected", { area: t(LIFE_AREA_TRANSLATION_KEYS[selected]) });
}

export function LifeAreaFilter({ selected, onChange, defaultOpen = false }: LifeAreaFilterProps) {
  const { t } = useI18n();
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(!open && "mb-6")}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="text-[var(--tend-text-muted)] hover:text-foreground"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {lifeAreaFilterToggleLabel(selected, t)}
      </Button>

      <div
        id={panelId}
        aria-hidden={!open}
        data-open={open}
        className={cn("tend-collapsible-reveal", !open && "pointer-events-none")}
      >
        <div className="tend-collapsible-reveal__inner">
          <div className="tend-collapsible-reveal__content">
            <fieldset className="mt-3 flex flex-wrap gap-2 border-0 p-0">
              <legend className="sr-only">{t("filter.byArea.legend")}</legend>
              <LifeAreaChip
                area="all"
                selected={selected === null}
                onClick={() => onChange(null)}
              />
              {LIFE_AREA_ORDER.map((area) => (
                <LifeAreaChip
                  key={area}
                  area={area}
                  selected={selected === area}
                  onClick={() => onChange(area)}
                />
              ))}
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
