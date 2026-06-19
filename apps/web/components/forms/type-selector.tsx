import { Alert, AlertDescription } from "@/components/ui/alert";
import { type TranslationKey, useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { TendItemType } from "@tend/domain";

interface TypeSelectorProps {
  value: TendItemType;
  onChange: (type: TendItemType) => void;
}

const OPTIONS: Array<{
  value: TendItemType;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    value: "want",
    titleKey: "type.want",
    descriptionKey: "items.add.type.want.description",
  },
  {
    value: "must",
    titleKey: "type.must",
    descriptionKey: "items.add.type.must.description",
  },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const { t } = useI18n();

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
              <p className="font-medium">{t(option.titleKey)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(option.descriptionKey)}</p>
            </button>
          );
        })}
      </div>

      <Alert variant="info">
        <AlertDescription>{t("items.add.type.must.hint")}</AlertDescription>
      </Alert>
    </div>
  );
}
