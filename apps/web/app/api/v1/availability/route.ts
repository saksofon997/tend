import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { serializeAvailabilityWindow } from "@/lib/availability/serialize";
import { formatZodError, replaceAvailabilitySchema } from "@/lib/availability/validation";
import { getDb } from "@/lib/db";
import { listAvailabilityWindowsForUser, replaceAvailabilityWindowsForUser } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const windows = await listAvailabilityWindowsForUser(getDb(), userOrError.id);

  return jsonData({
    windows: windows.map(serializeAvailabilityWindow),
  });
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

  const parsed = replaceAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const windows = await replaceAvailabilityWindowsForUser(
    getDb(),
    userOrError.id,
    parsed.data.windows,
  );

  return jsonData({
    windows: windows.map(serializeAvailabilityWindow),
  });
}
