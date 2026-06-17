import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeUserSettings } from "@/lib/settings/serialize";
import { formatZodError, updateSettingsSchema } from "@/lib/settings/validation";
import { getUserSettings, updateUserTimezone } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const settings = await getUserSettings(getDb(), userOrError.id);
  if (!settings) {
    return jsonError("User settings not found", 404);
  }

  return jsonData({ settings: serializeUserSettings(settings) });
}

export async function PUT(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const settings = await updateUserTimezone(getDb(), userOrError.id, parsed.data.timezone);
  return jsonData({ settings: serializeUserSettings(settings) });
}
