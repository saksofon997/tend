interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PRESETS = {
  "no-items": {
    title: "Nothing to tend yet",
    description: "Add something you want to maintain — plants, sheets, a friendship.",
  },
  "all-fresh": {
    title: "Nothing needs attention right now",
    description: "Your rhythms are in good shape. Tend will let you know when something drifts.",
  },
  "no-activity": {
    title: "No tending logged yet",
    description: "When you mark items as tended, they'll show up here.",
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
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-[var(--tend-bg-muted)]/50 px-6 py-10 text-center">
      <h3 className="font-display text-lg font-medium text-foreground">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function EmptyStatePreset({ preset, action }: EmptyStatePresetProps) {
  const copy = PRESETS[preset];
  return <EmptyState title={copy.title} description={copy.description} action={action} />;
}
