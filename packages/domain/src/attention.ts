import { computeStatus } from "./status";
import type { TendItemInput, TendStatus } from "./types";

const STATUS_RANK: Record<TendStatus, number> = {
  needs_attention: 0,
  getting_stale: 1,
  fresh: 2,
};

function attentionRank(status: TendStatus, type: TendItemInput["type"]): number {
  const statusBase = STATUS_RANK[status] * 2;
  if (status === "fresh") {
    return statusBase;
  }

  return statusBase + (type === "want" ? 1 : 0);
}

function lastTendedSortValue(lastTendedAt: Date | null): number {
  return lastTendedAt?.getTime() ?? 0;
}

export interface SortedTendItem extends TendItemInput {
  status: TendStatus;
}

export function sortForAttention(items: TendItemInput[], now: Date): SortedTendItem[] {
  return items
    .filter((item) => !item.archivedAt)
    .map((item) => ({
      ...item,
      status: computeStatus({
        lastTendedAt: item.lastTendedAt,
        rhythmDays: item.rhythmDays,
        now,
      }),
    }))
    .sort((left, right) => {
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

export function groupForAttention(items: TendItemInput[], now: Date) {
  const sorted = sortForAttention(items, now);

  return {
    needsAttention: sorted.filter((item) => item.status === "needs_attention"),
    gettingStale: sorted.filter((item) => item.status === "getting_stale"),
    lookingGood: sorted.filter((item) => item.status === "fresh"),
    hero: sorted.find(
      (item) => item.status === "needs_attention" || item.status === "getting_stale",
    ),
  };
}
