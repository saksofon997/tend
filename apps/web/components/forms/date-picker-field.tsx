"use client";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  calendarDateFromLocalDate,
  calendarDisabledMatchers,
  localDateFromCalendarDate,
  retainMonthIfUnchanged,
} from "@/lib/design/calendar-date";
import { formatDatePickerLabel } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isCalendarDate } from "@tend/domain";
import { CalendarDays, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DatePickerFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  allowEmpty?: boolean;
  invalid?: boolean;
}

export function DatePickerField({
  id,
  value,
  onChange,
  min,
  max,
  placeholder,
  allowEmpty = false,
  invalid = false,
}: DatePickerFieldProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => (value && isCalendarDate(value) ? localDateFromCalendarDate(value) : undefined),
    [value],
  );
  const [month, setMonth] = useState<Date>(() => selected ?? new Date());
  const disabled = useMemo(() => calendarDisabledMatchers(min, max), [max, min]);
  const label = value
    ? formatDatePickerLabel(value, locale)
    : (placeholder ?? t("activity.search.anyDate"));

  const handleMonthChange = useCallback((next: Date) => {
    setMonth((current) => retainMonthIfUnchanged(current, next));
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    setMonth((current) => retainMonthIfUnchanged(current, selected));
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-invalid={invalid || undefined}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-base text-foreground",
              "focus-visible:border-[var(--tend-border-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              !value && "text-[var(--tend-text-subtle)]",
              invalid && "border-destructive",
              allowEmpty && value && "pr-9",
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 truncate">{label}</span>
          </button>
        </PopoverTrigger>
        {allowEmpty && value ? (
          <button
            type="button"
            className="absolute top-1/2 right-1 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--tend-bg-subtle)] hover:text-foreground"
            onClick={() => onChange("")}
            aria-label={t("activity.search.clearDate")}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          required={!allowEmpty}
          selected={selected}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={(date: Date | undefined) => {
            if (!date) {
              if (allowEmpty) {
                onChange("");
              }
              return;
            }

            onChange(calendarDateFromLocalDate(date));
            setOpen(false);
          }}
          disabled={disabled.length > 0 ? disabled : undefined}
          labels={{
            labelPrevious: () => t("calendar.previousMonth"),
            labelNext: () => t("calendar.nextMonth"),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
