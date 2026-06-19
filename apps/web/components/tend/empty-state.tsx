"use client";

import { type TranslationKey, useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

type PresetCopy = { titleKey: TranslationKey; descriptionKey?: TranslationKey };

const PRESETS: Record<"no-items" | "all-fresh" | "no-activity" | "no-availability", PresetCopy> = {
  "no-items": {
    titleKey: "home.empty.title",
    descriptionKey: "home.empty.body",
  },
  "all-fresh": {
    titleKey: "home.allFresh.title",
    descriptionKey: "home.allFresh.body",
  },
  "no-activity": {
    titleKey: "activity.empty.title",
    descriptionKey: "activity.empty.body",
  },
  "no-availability": {
    titleKey: "availability.empty.title",
  },
};

export type EmptyStatePreset = keyof typeof PRESETS;

interface EmptyStatePresetProps {
  preset: EmptyStatePreset;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-[var(--tend-bg-muted)]/50 px-6 py-10 text-center",
        className,
      )}
    >
      <h3 className="font-display text-lg font-medium text-foreground">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function EmptyStatePreset({ preset, action, className }: EmptyStatePresetProps) {
  const { t } = useI18n();
  const copy = PRESETS[preset];
  return (
    <EmptyState
      title={t(copy.titleKey)}
      description={copy.descriptionKey ? t(copy.descriptionKey) : undefined}
      action={action}
      className={className}
    />
  );
}
