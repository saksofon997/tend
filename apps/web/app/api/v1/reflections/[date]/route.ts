import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { serializeReflection } from "@/lib/reflections/serialize";
import {
  calendarDateSchema,
  formatZodError,
  upsertReflectionSchema,
} from "@/lib/reflections/validation";
import { deleteReflectionForUser, getReflectionForUser, upsertReflectionForUser } from "@tend/db";
import { normalizeReflectionBody } from "@tend/domain";

type RouteContext = {
  params: Promise<{ date: string }>;
};

export const runtime = "nodejs";

async function parseEntryDate(context: RouteContext) {
  const { date } = await context.params;
  return calendarDateSchema.safeParse(date);
}

export async function GET(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const parsedDate = await parseEntryDate(context);
  if (!parsedDate.success) {
    return jsonError(formatZodError(parsedDate.error), 400);
  }

  const entry = await getReflectionForUser(getDb(), userOrError.id, parsedDate.data);
  return jsonData({ entry: entry ? serializeReflection(entry) : null });
}

export async function PUT(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const parsedDate = await parseEntryDate(context);
  if (!parsedDate.success) {
    return jsonError(formatZodError(parsedDate.error), 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertReflectionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const normalized = normalizeReflectionBody(parsed.data.body);
  const database = getDb();

  if (normalized.trim().length === 0) {
    await deleteReflectionForUser(database, userOrError.id, parsedDate.data);
    return jsonData({ entry: null });
  }

  const entry = await upsertReflectionForUser(database, userOrError.id, {
    entryDate: parsedDate.data,
    body: normalized,
  });

  return jsonData({ entry: serializeReflection(entry) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const parsedDate = await parseEntryDate(context);
  if (!parsedDate.success) {
    return jsonError(formatZodError(parsedDate.error), 400);
  }

  await deleteReflectionForUser(getDb(), userOrError.id, parsedDate.data);
  return jsonData({ ok: true });
}
