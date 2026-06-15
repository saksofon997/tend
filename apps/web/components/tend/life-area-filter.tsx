"use client";

import { LifeAreaChip } from "@/components/tend/life-area-chip";
import { LIFE_AREA_ORDER } from "@/lib/onboarding/constants";
import type { LifeArea } from "@tend/domain";

interface LifeAreaFilterProps {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
}

export function LifeAreaFilter({ selected, onChange }: LifeAreaFilterProps) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium text-muted-foreground">Filter by area</p>
      <fieldset className="flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Filter by life area</legend>
        <LifeAreaChip area="all" selected={selected === null} onClick={() => onChange(null)} />
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
  );
}
