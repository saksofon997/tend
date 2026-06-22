import { toDomainAvailabilityWindow } from "@/lib/availability/serialize";
import { getSharedUserMapForItems, sharedUserForItem } from "@/lib/items/sharing";
import { serializeReminderResult, toTendItemInput } from "@/lib/reminders/serialize";
import type { RemindersApiResponse } from "@/lib/reminders/serialize";
import {
  type Database,
  getUserSettings,
  listAvailabilityWindowsForUser,
  listItemsForUser,
} from "@tend/db";
import {
  eligibleReminders,
  isValidTimeZone,
  localDateInTimeZone,
  zonedLocalDateToInstant,
} from "@tend/domain";

export async function getReminderResponseForUser(
  database: Database,
  userId: string,
  now = new Date(),
): Promise<RemindersApiResponse> {
  const [items, availabilityRows, settings] = await Promise.all([
    listItemsForUser(database, userId, {}),
    listAvailabilityWindowsForUser(database, userId),
    getUserSettings(database, userId),
  ]);

  const timezone =
    settings?.timezone && isValidTimeZone(settings.timezone) ? settings.timezone : "UTC";
  const localNow = localDateInTimeZone(now, timezone);
  const availability = availabilityRows.map(toDomainAvailabilityWindow);
  const itemInputs = items.map((item) => {
    const input = toTendItemInput(item);
    return {
      ...input,
      lastTendedAt: input.lastTendedAt ? localDateInTimeZone(input.lastTendedAt, timezone) : null,
    };
  });
  const result = eligibleReminders(itemInputs, availability, localNow);
  const sharedUserMap = await getSharedUserMapForItems(database, userId, items);
  const sharedUsersByItemId = new Map(
    items.map((item) => [item.id, sharedUserForItem(item, userId, sharedUserMap)]),
  );

  return serializeReminderResult(
    result,
    (date) => zonedLocalDateToInstant(date, timezone),
    sharedUsersByItemId,
  );
}
