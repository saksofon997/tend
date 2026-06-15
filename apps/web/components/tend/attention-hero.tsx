import { MarkTendedButton } from "@/components/tend/mark-tended-button";
import { RelativeTime } from "@/components/tend/relative-time";
import { StatusBadge } from "@/components/tend/status-badge";
import { TypeBadge } from "@/components/tend/type-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AttentionListItem } from "@/lib/design/home-groups";
import { heroAttentionCopy } from "@/lib/design/relative-time";
import { cn } from "@/lib/utils";

interface AttentionHeroProps {
  item: Pick<
    AttentionListItem,
    "id" | "name" | "type" | "status" | "lastTendedAt" | "daysSinceLastTended"
  >;
  onTend: (id: string) => Promise<void>;
}

export function AttentionHero({ item, onTend }: AttentionHeroProps) {
  if (item.status === "fresh") {
    return null;
  }

  return (
    <Card
      className={cn(
        "mb-8 border-[var(--tend-border)] shadow-[var(--tend-shadow-md)]",
        item.type === "must" &&
          "border-l-4 border-l-[var(--tend-type-must-border)] bg-[var(--tend-type-must-bg)]",
      )}
    >
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">Could use attention</p>
        <h2 className="mt-1 font-display text-3xl font-medium text-foreground text-balance">
          {heroAttentionCopy(item.name, item.status)}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} size="md" />
          <TypeBadge type={item.type} size="md" />
          <RelativeTime date={item.lastTendedAt} daysSince={item.daysSinceLastTended} />
        </div>
        <div className="mt-6">
          <MarkTendedButton itemId={item.id} onTend={onTend} size="lg" />
        </div>
      </CardContent>
    </Card>
  );
}
