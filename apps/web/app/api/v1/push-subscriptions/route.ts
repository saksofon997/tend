import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializePushSubscription } from "@/lib/notifications/serialize";
import {
  deletePushSubscriptionSchema,
  formatZodError,
  pushSubscriptionSchema,
} from "@/lib/notifications/validation";
import { deletePushSubscriptionForUser, upsertPushSubscriptionForUser } from "@tend/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const subscription = await upsertPushSubscriptionForUser(getDb(), userOrError.id, parsed.data);
  return jsonData({ subscription: serializePushSubscription(subscription) }, 201);
}

export async function DELETE(request: Request) {
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

  const parsed = deletePushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  await deletePushSubscriptionForUser(getDb(), userOrError.id, parsed.data.token);
  return jsonData({ ok: true });
}
