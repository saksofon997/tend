"use client";

import { useI18n } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { CHECK_IN_PERIODS, type CheckInPeriod } from "@tend/domain";

const PERIOD_LABEL_KEYS: Record<CheckInPeriod, TranslationKey> = {
  week: "checkIn.period.week",
  month: "checkIn.period.month",
  ninety: "checkIn.period.ninety",
  all: "checkIn.period.all",
};

interface CheckInPeriodFilterProps {
  period: CheckInPeriod;
  onChange: (period: CheckInPeriod) => void;
}

export function CheckInPeriodFilter({ period, onChange }: CheckInPeriodFilterProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("checkIn.period.label")}>
      {CHECK_IN_PERIODS.map((entry) => {
        const selected = entry === period;
        return (
          <button
            key={entry}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(entry)}
            className={cn(
              "min-h-11 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--tend-duration-fast)]",
              selected
                ? "bg-[var(--tend-primary-muted)] text-primary"
                : "bg-[var(--tend-bg-muted)] text-muted-foreground hover:bg-[var(--tend-bg-subtle)] hover:text-foreground",
            )}
          >
            {t(PERIOD_LABEL_KEYS[entry])}
          </button>
        );
      })}
    </div>
  );
}
