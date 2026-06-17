import { jsonData, jsonError } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { getDb } from "@/lib/db";
import { completeOnboardingSchema, formatZodError } from "@/lib/onboarding/validation";
import { completeOnboarding, getUserSettings, isOnboardingComplete } from "@tend/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  const settings = await getUserSettings(getDb(), userOrError.id);

  return jsonData({
    completed: isOnboardingComplete(settings),
    onboardingCompletedAt: settings?.onboardingCompletedAt?.toISOString() ?? null,
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

  const parsed = completeOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), 400);
  }

  const settings = await completeOnboarding(getDb(), userOrError.id);

  return jsonData({
    completed: true,
    onboardingCompletedAt: settings.onboardingCompletedAt?.toISOString() ?? null,
  });
}
