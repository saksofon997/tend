import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const PRESETS = {
  "no-items": {
    title: "Nothing to tend yet",
    description: "Add something you want to keep up with: plants, sheets, a friendship.",
  },
  "all-fresh": {
    title: "Nothing needs attention right now",
    description: "Your rhythms look good. Tend will nudge you when something starts to drift.",
  },
  "no-activity": {
    title: "No tending logged yet",
    description: "Mark items as tended and they'll show up here.",
  },
  "no-availability": {
    title: "No availability set yet",
    description:
      "Add windows for days you're usually free. Wants wait for these times; musts still surface when they need attention.",
  },
} as const;

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
  const copy = PRESETS[preset];
  return (
    <EmptyState
      title={copy.title}
      description={copy.description}
      action={action}
      className={className}
    />
  );
}
