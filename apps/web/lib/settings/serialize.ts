import type { UserSettingsRow } from "@tend/db";

export interface UserSettingsResponse {
  timezone: string;
  onboardingCompletedAt: string | null;
}

export function serializeUserSettings(settings: UserSettingsRow): UserSettingsResponse {
  return {
    timezone: settings.timezone,
    onboardingCompletedAt: settings.onboardingCompletedAt?.toISOString() ?? null,
  };
}
