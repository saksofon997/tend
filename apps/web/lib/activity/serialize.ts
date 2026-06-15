import type { RecentEventWithItem } from "@tend/db";

export interface ActivityEntryResponse {
  id: string;
  itemId: string;
  itemName: string;
  tendedAt: string;
  createdAt: string;
}

export function serializeActivityEntry(row: RecentEventWithItem): ActivityEntryResponse {
  return {
    id: row.event.id,
    itemId: row.item.id,
    itemName: row.item.name,
    tendedAt: row.event.tendedAt.toISOString(),
    createdAt: row.event.createdAt.toISOString(),
  };
}
