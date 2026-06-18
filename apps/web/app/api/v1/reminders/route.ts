import { jsonData } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { toDomainAvailabilityWindow } from "@/lib/availability/serialize";
import { getDb } from "@/lib/db";
import { serializeReminderResult, toTendItemInput } from "@/lib/reminders/serialize";
import { getUserSettings, listAvailabilityWindowsForUser, listItemsForUser } from "@tend/db";
import {
  eligibleReminders,
  isValidTimeZone,
  localDateInTimeZone,
  zonedLocalDateToInstant,
} from "@tend/domain";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const now = new Date();
  const [items, availabilityRows, settings] = await Promise.all([
    listItemsForUser(getDb(), userOrError.id, {}),
    listAvailabilityWindowsForUser(getDb(), userOrError.id),
    getUserSettings(getDb(), userOrError.id),
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

  return jsonData(
    serializeReminderResult(result, (date) => zonedLocalDateToInstant(date, timezone)),
  );
}
