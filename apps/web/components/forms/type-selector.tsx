import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { TendItemType } from "@tend/domain";

interface TypeSelectorProps {
  value: TendItemType;
  onChange: (type: TendItemType) => void;
}

const OPTIONS: Array<{
  value: TendItemType;
  title: string;
  description: string;
}> = [
  {
    value: "want",
    title: "Want",
    description: "Flexible, no guilt if it drifts",
  },
  {
    value: "must",
    title: "Must",
    description: "Important, stronger reminders",
  },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const accent =
            option.value === "must"
              ? "border-[var(--tend-type-must-border)] bg-[var(--tend-type-must-bg)]"
              : "border-[var(--tend-type-want-border)] bg-[var(--tend-type-want-bg)]";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors duration-[var(--tend-duration-fast)]",
                selected
                  ? cn("border-2", accent)
                  : "border-border bg-card hover:bg-[var(--tend-bg-subtle)]",
              )}
            >
              <p className="font-medium">{option.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
            </button>
          );
        })}
      </div>

      <Alert variant="info">
        <AlertDescription>Use must sparingly for things that truly cannot drift.</AlertDescription>
      </Alert>
    </div>
  );
}
