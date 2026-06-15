"use client";

import { LifeAreaChip } from "@/components/tend/life-area-chip";
import { LIFE_AREA_ORDER } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";
import { PRESETS_BY_AREA } from "@tend/domain";
import type { LifeArea, TendPreset } from "@tend/domain";
import { useState } from "react";

interface PresetSuggestionsProps {
  onSelect: (preset: TendPreset) => void;
  selectedPresetName?: string;
  className?: string;
  id?: string;
}

export function PresetSuggestions({
  onSelect,
  selectedPresetName,
  className,
  id,
}: PresetSuggestionsProps) {
  const [selectedArea, setSelectedArea] = useState<Exclude<LifeArea, "personal">>("household");
  const presets = PRESETS_BY_AREA[selectedArea];

  return (
    <section
      id={id}
      className={cn(
        "rounded-lg border border-[var(--tend-border-subtle)] bg-[var(--tend-bg-elevated)] p-4",
        className,
      )}
      aria-label="Item suggestions"
    >
      <div className="mb-4">
        <p className="text-sm text-muted-foreground/90">Tap one to pre-fill the form below.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Life areas">
        {LIFE_AREA_ORDER.map((area) => (
          <LifeAreaChip
            key={area}
            area={area}
            selected={selectedArea === area}
            onClick={() => setSelectedArea(area)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = selectedPresetName === preset.name;

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-normal transition-colors duration-[var(--tend-duration-fast)]",
                isSelected
                  ? "border-primary bg-[var(--tend-primary-muted)] text-primary"
                  : "border-[var(--tend-border-subtle)] bg-[var(--tend-bg-elevated)] text-muted-foreground hover:border-[var(--tend-border)] hover:text-foreground",
              )}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
