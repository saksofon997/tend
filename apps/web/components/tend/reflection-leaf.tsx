"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { REFLECTION_BODY_MAX_LENGTH } from "@tend/domain";

interface ReflectionLeafProps {
  id?: string;
  dateLabel: string;
  body: string;
  placeholder: string;
  onChange: (body: string) => void;
  characterCountLabel: string;
  disabled?: boolean;
}

export function ReflectionLeaf({
  id,
  dateLabel,
  body,
  placeholder,
  onChange,
  characterCountLabel,
  disabled = false,
}: ReflectionLeafProps) {
  return (
    <article className="tend-paper-leaf tend-thought-card border border-border">
      <header className="flex items-baseline justify-between gap-3 px-4 pt-3 pb-1">
        <h2 className="font-display text-base font-medium text-foreground">{dateLabel}</h2>
        <p className="text-muted-foreground text-xs tabular-nums">{characterCountLabel}</p>
      </header>
      <label className="sr-only" htmlFor={id}>
        {dateLabel}
      </label>
      <Textarea
        id={id}
        value={body}
        onChange={(event) => {
          const next = event.target.value;
          if (next.length <= REFLECTION_BODY_MAX_LENGTH) {
            onChange(next);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={REFLECTION_BODY_MAX_LENGTH}
        className="tend-paper-leaf__input min-h-[16.5rem] rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        spellCheck
      />
    </article>
  );
}

export function ReflectionTile({
  dayNumber,
  preview,
  selected,
  today,
  emptyLabel,
}: {
  dayNumber: number;
  preview: string;
  selected: boolean;
  today: boolean;
  emptyLabel: string;
}) {
  return (
    <span
      className={cn(
        "tend-paper-leaf tend-paper-leaf--tile flex min-h-[5.75rem] w-full flex-col items-stretch rounded-md border p-1.5 text-left",
        selected ? "border-[var(--tend-border-focus)] ring-2 ring-ring" : "border-border",
        today && !selected ? "border-[var(--tend-status-fresh)]" : null,
      )}
    >
      <span
        className={cn(
          "text-xs font-medium tabular-nums",
          today ? "text-primary" : "text-muted-foreground",
        )}
      >
        {dayNumber}
      </span>
      <span className="mt-1 line-clamp-3 font-display text-[0.65rem] leading-snug text-foreground">
        {preview || emptyLabel}
      </span>
    </span>
  );
}
