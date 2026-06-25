import type { TendEventRow, TendItemRow } from "@tend/db";
import { computeStatus, daysSinceLastTended } from "@tend/domain";
import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";

export interface ItemResponse {
  id: string;
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  sharedWith: SharedTendUserResponse | null;
  canDelete: boolean;
  lastTendedAt: string | null;
  status: TendStatus;
  daysSinceLastTended: number | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharedTendUserResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface TendEventResponse {
  id: string;
  itemId: string;
  tendedAt: string;
  createdAt: string;
}

export function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

export function serializeItem(
  item: TendItemRow,
  now = new Date(),
  sharedWith: SharedTendUserResponse | null = null,
  currentUserId?: string,
): ItemResponse {
  const status = computeStatus({
    lastTendedAt: item.lastTendedAt,
    rhythmDays: item.rhythmDays,
    now,
  });

  return {
    id: item.id,
    name: item.name,
    type: item.type,
    rhythmDays: item.rhythmDays,
    lifeArea: item.lifeArea,
    sharedWith,
    canDelete: currentUserId ? item.userId === currentUserId : false,
    lastTendedAt: toIso(item.lastTendedAt),
    status,
    daysSinceLastTended: daysSinceLastTended(item.lastTendedAt, now),
    archivedAt: toIso(item.archivedAt),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeTendEvent(event: TendEventRow): TendEventResponse {
  return {
    id: event.id,
    itemId: event.itemId,
    tendedAt: event.tendedAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
  };
}

export function statusForItem(
  item: Pick<TendItemRow, "lastTendedAt" | "rhythmDays">,
  now = new Date(),
) {
  return computeStatus({
    lastTendedAt: item.lastTendedAt,
    rhythmDays: item.rhythmDays,
    now,
  });
}
