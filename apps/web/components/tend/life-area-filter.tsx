"use client";

import { LifeAreaChip } from "@/components/tend/life-area-chip";
import { Button } from "@/components/ui/button";
import { LIFE_AREA_LABELS } from "@/lib/design/status-labels";
import { LIFE_AREA_ORDER } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";
import type { LifeArea } from "@tend/domain";
import { useId, useState } from "react";

interface LifeAreaFilterProps {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  defaultOpen?: boolean;
}

export function lifeAreaFilterToggleLabel(selected: LifeArea | null): string {
  if (selected === null) {
    return "Filter by area?";
  }

  return `Filter by area · ${LIFE_AREA_LABELS[selected]}`;
}

export function LifeAreaFilter({ selected, onChange, defaultOpen = false }: LifeAreaFilterProps) {
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
        {lifeAreaFilterToggleLabel(selected)}
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
              <legend className="sr-only">Filter by life area</legend>
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
