import { useI18n } from "@/lib/i18n/client";
import { LIFE_AREA_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";
import type { LifeArea } from "@tend/domain";

interface LifeAreaChipProps {
  area: LifeArea | "all";
  selected?: boolean;
  onClick?: () => void;
}

export function LifeAreaChip({ area, selected, onClick }: LifeAreaChipProps) {
  const { t } = useI18n();
  const label = area === "all" ? t("common.all") : t(LIFE_AREA_TRANSLATION_KEYS[area]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[var(--tend-radius-chip)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--tend-duration-fast)]",
        selected
          ? "tend-dew-selected"
          : "tend-dew-soft text-[var(--tend-text-muted)] hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
