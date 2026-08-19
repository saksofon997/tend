import type { RecentEventWithItem } from "@tend/db";

export interface ActivityEntryResponse {
  id: string;
  itemId: string;
  itemName: string;
  itemType: "must" | "want";
  tendedAt: string;
  createdAt: string;
}

export function serializeActivityEntry(row: RecentEventWithItem): ActivityEntryResponse {
  return {
    id: row.event.id,
    itemId: row.item.id,
    itemName: row.item.name,
    itemType: row.item.type,
    tendedAt: row.event.tendedAt.toISOString(),
    createdAt: row.event.createdAt.toISOString(),
  };
}
