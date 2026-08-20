import { serializeActivityEntry } from "@/lib/activity/serialize";
import { CHECK_IN_EVENT_LIMIT } from "@/lib/check-in/validation";
import { serializeItem } from "@/lib/items/serialize";
import { getSharedUserMapForItems, sharedUserForItem } from "@/lib/items/sharing";
import type { Database } from "@tend/db";
import { listItemsForUser, listRecentEventsForUser } from "@tend/db";
import { buildCheckInSummary, checkInPeriodStart, eventsInCheckInPeriod } from "@tend/domain";
import type { CheckInPeriod, CheckInSummary } from "@tend/domain";

export async function loadCheckInSummary(
  database: Database,
  userId: string,
  period: CheckInPeriod,
  now = new Date(),
): Promise<CheckInSummary> {
  const from = checkInPeriodStart(period, now);
  const [items, recentEventRows] = await Promise.all([
    listItemsForUser(database, userId, {}),
    listRecentEventsForUser(database, userId, CHECK_IN_EVENT_LIMIT, from ? { from } : undefined),
  ]);
  const sharedUserMap = await getSharedUserMapForItems(database, userId, items);
  const serializedItems = items.map((item) =>
    serializeItem(item, now, sharedUserForItem(item, userId, sharedUserMap), userId),
  );
  const events = eventsInCheckInPeriod(recentEventRows.map(serializeActivityEntry), period, now);

  return buildCheckInSummary(serializedItems, events);
}
