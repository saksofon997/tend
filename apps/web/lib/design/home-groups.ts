import type { ItemResponse } from "@/lib/items/serialize";
import type { TendItemType, TendStatus } from "@tend/domain";

export interface AttentionListItem {
  id: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  lastTendedAt: string | null;
  rhythmDays: number;
  lifeArea: ItemResponse["lifeArea"];
  sharedWith: ItemResponse["sharedWith"];
  daysSinceLastTended: number | null;
}

export interface AttentionGroups {
  needsAttention: AttentionListItem[];
  gettingStale: AttentionListItem[];
  lookingGood: AttentionListItem[];
}

const STATUS_RANK: Record<TendStatus, number> = {
  needs_attention: 0,
  getting_stale: 1,
  fresh: 2,
};

function attentionRank(status: TendStatus, type: TendItemType): number {
  const statusBase = STATUS_RANK[status] * 2;
  if (status === "fresh") {
    return statusBase;
  }

  return statusBase + (type === "want" ? 1 : 0);
}

function lastTendedSortValue(lastTendedAt: string | null): number {
  return lastTendedAt ? new Date(lastTendedAt).getTime() : 0;
}

function sortForAttention(items: AttentionListItem[]): AttentionListItem[] {
  return [...items].sort((left, right) => {
    const rankDiff =
      attentionRank(left.status, left.type) - attentionRank(right.status, right.type);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const lastTendedDiff =
      lastTendedSortValue(left.lastTendedAt) - lastTendedSortValue(right.lastTendedAt);
    if (lastTendedDiff !== 0) {
      return lastTendedDiff;
    }

    return left.name.localeCompare(right.name);
  });
}

export function toAttentionListItem(item: ItemResponse): AttentionListItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    status: item.status,
    lastTendedAt: item.lastTendedAt,
    rhythmDays: item.rhythmDays,
    lifeArea: item.lifeArea,
    sharedWith: item.sharedWith,
    daysSinceLastTended: item.daysSinceLastTended,
  };
}

export function buildAttentionGroups(items: ItemResponse[]): AttentionGroups {
  const active = items.filter((item) => !item.archivedAt);
  const sorted = sortForAttention(active.map(toAttentionListItem));

  return {
    needsAttention: sorted.filter((item) => item.status === "needs_attention"),
    gettingStale: sorted.filter((item) => item.status === "getting_stale"),
    lookingGood: sorted.filter((item) => item.status === "fresh"),
  };
}

export function hasItemsNeedingAttention(groups: AttentionGroups): boolean {
  return groups.needsAttention.length > 0 || groups.gettingStale.length > 0;
}

export function shouldShowAllFreshBanner(groups: AttentionGroups): boolean {
  return !hasItemsNeedingAttention(groups) && groups.lookingGood.length > 0;
}

export function getAttentionSectionDefaults(
  needsAttentionCount: number,
  gettingStaleCount: number,
) {
  const needsAttentionExpanded = needsAttentionCount > 0;

  return {
    needsAttention: needsAttentionExpanded,
    gettingStale: !needsAttentionExpanded && gettingStaleCount > 0,
    lookingGood: false,
  } as const;
}
