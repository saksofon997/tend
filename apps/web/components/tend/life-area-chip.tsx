import { LIFE_AREA_LABELS } from "@/lib/design/status-labels";
import { cn } from "@/lib/utils";
import type { LifeArea } from "@tend/domain";

interface LifeAreaChipProps {
  area: LifeArea | "all";
  selected?: boolean;
  onClick?: () => void;
}

export function LifeAreaChip({ area, selected, onClick }: LifeAreaChipProps) {
  const label = area === "all" ? "All" : LIFE_AREA_LABELS[area];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--tend-duration-fast)]",
        selected
          ? "bg-[var(--tend-primary-muted)] text-primary"
          : "bg-[var(--tend-bg-muted)] text-muted-foreground hover:bg-[var(--tend-bg-subtle)] hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
