"use client";

import { ReflectionTile } from "@/components/tend/reflection-leaf";
import { Calendar } from "@/components/ui/calendar";
import { calendarDateFromLocalDate, localDateFromCalendarDate } from "@/lib/design/calendar-date";
import { formatDatePickerLabel } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { WEEKDAY_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";
import { previewReflectionBody } from "@tend/domain";
import { createContext, useContext } from "react";
import type { DayButtonProps } from "react-day-picker";

interface ReflectionsMonthGridProps {
  year: number;
  month: number;
  selectedDate: string;
  today: string;
  bodies: Map<string, string>;
  onSelect: (date: string) => void;
  onMonthChange: (next: { year: number; month: number }) => void;
}

const MonthGridContext = createContext<{
  bodies: Map<string, string>;
  today: string;
  emptyLabel: string;
  locale: "en" | "sr";
}>({
  bodies: new Map(),
  today: "",
  emptyLabel: "",
  locale: "en",
});

function PaperDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const context = useContext(MonthGridContext);
  const date = calendarDateFromLocalDate(day.date);
  const body = context.bodies.get(date) ?? "";

  return (
    <button
      {...props}
      type="button"
      className={cn("flex h-auto w-full p-0 font-normal", className)}
      aria-label={formatDatePickerLabel(date, context.locale)}
      aria-pressed={modifiers.selected}
    >
      <ReflectionTile
        dayNumber={day.date.getDate()}
        preview={previewReflectionBody(body, 70)}
        selected={modifiers.selected}
        today={date === context.today}
        emptyLabel={context.emptyLabel}
      />
    </button>
  );
}

export function ReflectionsMonthGrid({
  year,
  month,
  selectedDate,
  today,
  bodies,
  onSelect,
  onMonthChange,
}: ReflectionsMonthGridProps) {
  const { locale, t } = useI18n();
  const displayedMonth = new Date(year, month - 1, 1);

  return (
    <MonthGridContext.Provider
      value={{ bodies, today, emptyLabel: t("reflections.emptyPreview"), locale }}
    >
      <div className="hidden md:block" aria-label={t("reflections.monthGrid")}>
        <Calendar
          mode="single"
          required
          showOutsideDays={false}
          month={displayedMonth}
          selected={localDateFromCalendarDate(selectedDate)}
          onMonthChange={(nextMonth) =>
            onMonthChange({ year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1 })
          }
          onSelect={(date) => {
            if (date) {
              onSelect(calendarDateFromLocalDate(date));
            }
          }}
          formatters={{
            formatWeekdayName: (date) =>
              t(WEEKDAY_TRANSLATION_KEYS[date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6]).slice(0, 2),
          }}
          labels={{
            labelPrevious: () => t("calendar.previousMonth"),
            labelNext: () => t("calendar.nextMonth"),
          }}
          className="w-full"
          classNames={{
            root: "w-full",
            month: "w-full gap-2",
            month_grid: "w-full",
            week: "mt-1.5 flex w-full gap-1.5",
            weekday: "flex-1 px-0.5 text-center text-muted-foreground text-xs",
            day: "min-w-0 flex-1 p-0",
            day_button: "h-auto w-full bg-transparent p-0 hover:bg-transparent",
            selected: "bg-transparent text-foreground",
            today: "bg-transparent",
          }}
          components={{
            DayButton: PaperDayButton,
          }}
        />
      </div>
    </MonthGridContext.Provider>
  );
}
