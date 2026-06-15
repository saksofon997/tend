import { Card } from "@/components/ui/card";
import { formatRhythm } from "@/lib/design/relative-time";
import { TYPE_LABELS } from "@/lib/design/status-labels";
import type { TendItemType } from "@tend/domain";

interface PresetCardProps {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  onSelect: () => void;
}

export function PresetCard({ name, type, rhythmDays, onSelect }: PresetCardProps) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <Card className="transition-colors duration-[var(--tend-duration-fast)] hover:bg-[var(--tend-bg-subtle)]">
        <div className="p-4">
          <p className="font-medium text-foreground">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {TYPE_LABELS[type]} · {formatRhythm(rhythmDays)}
          </p>
        </div>
      </Card>
    </button>
  );
}
