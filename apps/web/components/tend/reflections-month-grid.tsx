"use client";

import { ReflectionTile } from "@/components/tend/reflection-leaf";
import { formatDatePickerLabel } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { WEEKDAY_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { calendarDateParts, monthGridDates, previewReflectionBody } from "@tend/domain";

interface ReflectionsMonthGridProps {
  year: number;
  month: number;
  selectedDate: string;
  today: string;
  bodies: Map<string, string>;
  onSelect: (date: string) => void;
}

export function ReflectionsMonthGrid({
  year,
  month,
  selectedDate,
  today,
  bodies,
  onSelect,
}: ReflectionsMonthGridProps) {
  const { locale, t } = useI18n();
  const cells = monthGridDates(year, month).filter((date): date is string => date !== null);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-7 gap-1.5" aria-label={t("reflections.monthGrid")}>
        {([0, 1, 2, 3, 4, 5, 6] as const).map((weekday) => (
          <div
            key={WEEKDAY_TRANSLATION_KEYS[weekday]}
            className="px-0.5 text-center text-muted-foreground text-xs"
          >
            {t(WEEKDAY_TRANSLATION_KEYS[weekday]).slice(0, 2)}
          </div>
        ))}
        {cells.map((date) => {
          const { day } = calendarDateParts(date);
          const body = bodies.get(date) ?? "";

          return (
            <div key={date} style={day === 1 ? { gridColumnStart: firstWeekday + 1 } : undefined}>
              <ReflectionTile
                dayNumber={day}
                preview={previewReflectionBody(body, 70)}
                selected={date === selectedDate}
                today={date === today}
                label={formatDatePickerLabel(date, locale)}
                emptyLabel={t("reflections.emptyPreview")}
                onSelect={() => onSelect(date)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
