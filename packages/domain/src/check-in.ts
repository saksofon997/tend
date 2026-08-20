import { MS_PER_DAY } from "./time";
import type { LifeArea, TendItemType, TendStatus } from "./types";

export const CHECK_IN_PERIODS = ["week", "month", "ninety", "all"] as const;

export type CheckInPeriod = (typeof CHECK_IN_PERIODS)[number];

const CHECK_IN_PERIOD_DAYS: Record<Exclude<CheckInPeriod, "all">, number> = {
  week: 7,
  month: 30,
  ninety: 90,
};

export function isCheckInPeriod(value: string): value is CheckInPeriod {
  return (CHECK_IN_PERIODS as readonly string[]).includes(value);
}

export function checkInPeriodStart(period: CheckInPeriod, now: Date): Date | null {
  if (period === "all") {
    return null;
  }

  return new Date(now.getTime() - CHECK_IN_PERIOD_DAYS[period] * MS_PER_DAY);
}

export function eventsInCheckInPeriod(
  events: CheckInEventInput[],
  period: CheckInPeriod,
  now: Date,
): CheckInEventInput[] {
  const start = checkInPeriodStart(period, now);
  if (!start) {
    return events;
  }

  return events.filter((event) => {
    const tendedAt = event.tendedAt instanceof Date ? event.tendedAt : new Date(event.tendedAt);
    return !Number.isNaN(tendedAt.getTime()) && tendedAt.getTime() >= start.getTime();
  });
}

export interface CheckInSharedUserInput {
  id?: string;
  displayName: string;
}

export interface CheckInItemInput {
  id: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  lifeArea?: LifeArea | null;
  sharedWith?: CheckInSharedUserInput | null;
}

export interface CheckInEventInput {
  id: string;
  itemId: string;
  itemName: string;
  tendedAt: Date | string;
}

export interface CheckInTopItem {
  itemId: string;
  name: string;
  count: number;
}

export interface CheckInTopSharedPerson {
  displayName: string;
  count: number;
}

export interface CheckInTopLifeArea {
  lifeArea: LifeArea;
  count: number;
}

export interface CheckInWeekdayCount {
  weekday: number;
  count: number;
}

export interface CheckInAttentionCounts {
  fresh: number;
  gettingStale: number;
  needsAttention: number;
}

export interface CheckInSummary {
  totalTends: number;
  tendedItemCount: number;
  careDays: number;
  activeItemCount: number;
  sharedItemCount: number;
  mostTendedItem: CheckInTopItem | null;
  mostTendedWith: CheckInTopSharedPerson | null;
  mostTendedLifeArea: CheckInTopLifeArea | null;
  mostActiveWeekday: CheckInWeekdayCount | null;
  weekdayCounts: CheckInWeekdayCount[];
  attentionCounts: CheckInAttentionCounts;
}

const WEEKDAY_COUNT_TEMPLATE: CheckInWeekdayCount[] = [
  { weekday: 0, count: 0 },
  { weekday: 1, count: 0 },
  { weekday: 2, count: 0 },
  { weekday: 3, count: 0 },
  { weekday: 4, count: 0 },
  { weekday: 5, count: 0 },
  { weekday: 6, count: 0 },
];

export function buildCheckInSummary(
  items: CheckInItemInput[],
  events: CheckInEventInput[],
): CheckInSummary {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const itemCounts = new Map<string, CheckInTopItem>();
  const sharedCounts = new Map<string, CheckInTopSharedPerson>();
  const lifeAreaCounts = new Map<LifeArea, CheckInTopLifeArea>();
  const weekdayCounts = WEEKDAY_COUNT_TEMPLATE.map((entry) => ({ ...entry }));
  const tendedItemIds = new Set<string>();
  const careDays = new Set<string>();

  for (const event of events) {
    tendedItemIds.add(event.itemId);
    const item = itemById.get(event.itemId);
    const itemName = item?.name ?? event.itemName;
    const currentItemCount = itemCounts.get(event.itemId);

    itemCounts.set(event.itemId, {
      itemId: event.itemId,
      name: itemName,
      count: (currentItemCount?.count ?? 0) + 1,
    });

    if (item?.sharedWith) {
      const key = item.sharedWith.id ?? item.sharedWith.displayName;
      const currentSharedCount = sharedCounts.get(key);
      sharedCounts.set(key, {
        displayName: item.sharedWith.displayName,
        count: (currentSharedCount?.count ?? 0) + 1,
      });
    }

    if (item?.lifeArea) {
      const currentLifeAreaCount = lifeAreaCounts.get(item.lifeArea);
      lifeAreaCounts.set(item.lifeArea, {
        lifeArea: item.lifeArea,
        count: (currentLifeAreaCount?.count ?? 0) + 1,
      });
    }

    const tendedAt = event.tendedAt instanceof Date ? event.tendedAt : new Date(event.tendedAt);
    if (!Number.isNaN(tendedAt.getTime())) {
      weekdayCounts[tendedAt.getDay()] = {
        weekday: tendedAt.getDay(),
        count: weekdayCounts[tendedAt.getDay()]?.count ?? 0,
      };
      weekdayCounts[tendedAt.getDay()].count += 1;
      careDays.add(tendedAt.toISOString().slice(0, 10));
    }
  }

  return {
    totalTends: events.length,
    tendedItemCount: tendedItemIds.size,
    careDays: careDays.size,
    activeItemCount: items.length,
    sharedItemCount: items.filter((item) => item.sharedWith).length,
    mostTendedItem: topByCount([...itemCounts.values()]),
    mostTendedWith: topByCount([...sharedCounts.values()]),
    mostTendedLifeArea: topByCount([...lifeAreaCounts.values()]),
    mostActiveWeekday: topByCount(weekdayCounts.filter((entry) => entry.count > 0)),
    weekdayCounts,
    attentionCounts: {
      fresh: items.filter((item) => item.status === "fresh").length,
      gettingStale: items.filter((item) => item.status === "getting_stale").length,
      needsAttention: items.filter((item) => item.status === "needs_attention").length,
    },
  };
}

function topByCount<T extends { count: number }>(entries: T[]): T | null {
  return entries.reduce<T | null>((top, entry) => {
    if (!top || entry.count > top.count) {
      return entry;
    }

    return top;
  }, null);
}
