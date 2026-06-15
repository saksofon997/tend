"use client";

import { MarkTendedButton } from "@/components/tend/mark-tended-button";
import { RelativeTime } from "@/components/tend/relative-time";
import { StatusBadge } from "@/components/tend/status-badge";
import { TypeBadge } from "@/components/tend/type-badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";
import Link from "next/link";

export interface TendItemCardData {
  id: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  lastTendedAt: string | null;
  daysSinceLastTended?: number | null;
  rhythmDays: number;
  lifeArea?: LifeArea | null;
}

interface TendItemCardProps extends TendItemCardData {
  onTend?: (id: string) => Promise<void>;
  subdued?: boolean;
}

export function TendItemCard({
  id,
  name,
  type,
  status,
  lastTendedAt,
  daysSinceLastTended,
  onTend,
  subdued = false,
}: TendItemCardProps) {
  const isMustAttention = type === "must" && status === "needs_attention";

  return (
    <Card
      className={cn(
        "transition-colors duration-[var(--tend-duration-normal)] hover:bg-[var(--tend-bg-subtle)]",
        isMustAttention &&
          "border-l-4 border-l-[var(--tend-type-must-border)] bg-[var(--tend-type-must-bg)]",
        subdued && "opacity-85",
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          href={`/items/${id}`}
          className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <p className="text-lg font-medium text-foreground">{name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TypeBadge type={type} />
            <RelativeTime date={lastTendedAt} daysSince={daysSinceLastTended} />
          </div>
        </Link>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
          <StatusBadge status={status} />
          {onTend ? <MarkTendedButton itemId={id} onTend={onTend} size="sm" /> : null}
        </div>
      </div>
    </Card>
  );
}
