import { jsonData } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { toDomainAvailabilityWindow } from "@/lib/availability/serialize";
import { getDb } from "@/lib/db";
import { serializeReminderResult, toTendItemInput } from "@/lib/reminders/serialize";
import { listAvailabilityWindowsForUser, listItemsForUser } from "@tend/db";
import { eligibleReminders } from "@tend/domain";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const now = new Date();
  const [items, availabilityRows] = await Promise.all([
    listItemsForUser(getDb(), userOrError.id, {}),
    listAvailabilityWindowsForUser(getDb(), userOrError.id),
  ]);

  const availability = availabilityRows.map(toDomainAvailabilityWindow);
  const itemInputs = items.map(toTendItemInput);
  const result = eligibleReminders(itemInputs, availability, now);

  return jsonData(serializeReminderResult(result));
}
