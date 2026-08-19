"use client";

import { formatDatePickerLabel } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isCalendarDate } from "@tend/domain";
import { CalendarDays, X } from "lucide-react";
import type { ChangeEvent } from "react";

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
  const label = value
    ? formatDatePickerLabel(value, locale)
    : (placeholder ?? t("activity.search.anyDate"));

  function handleNativeChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (isCalendarDate(next)) {
      onChange(next);
    }
  }

  return (
    <div className="group relative">
      <div
        className={cn(
          "pointer-events-none flex h-10 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-base text-foreground",
          "group-focus-within:border-[var(--tend-border-focus)] group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-1",
          !value && "text-[var(--tend-text-subtle)]",
          invalid && "border-destructive",
          allowEmpty && value && "pr-9",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={handleNativeChange}
        aria-invalid={invalid || undefined}
        className={cn(
          "tend-date-picker-native absolute inset-0 z-10 cursor-pointer opacity-0",
          allowEmpty && value && "right-8",
        )}
      />
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
  );
}
