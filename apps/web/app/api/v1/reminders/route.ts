import { jsonData } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { getReminderResponseForUser } from "@/lib/reminders/user-reminders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  return jsonData(await getReminderResponseForUser(getDb(), userOrError.id));
}
