import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";

export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface UserSettingsResponse {
  timezone: string;
  onboardingCompletedAt: string | null;
}

export interface ItemResponse {
  id: string;
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  sharedWith: SharedTendUserResponse | null;
  lastTendedAt: string | null;
  status: TendStatus;
  daysSinceLastTended: number | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharedTendUserResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface ActivityEntryResponse {
  id: string;
  itemId: string;
  itemName: string;
  tendedAt: string;
  createdAt: string;
}

export interface AvailabilityWindowResponse {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStatusResponse {
  completed: boolean;
  onboardingCompletedAt: string | null;
}

export interface ReminderResponse {
  itemId: string;
  name: string;
  type: TendItemType;
  status: Exclude<TendStatus, "fresh">;
  daysSinceLastTended: number | null;
  sharedWith: SharedTendUserResponse | null;
  emphasis: "strong" | "normal";
  visibility: "now" | "next_window";
  copy: string;
}

export interface RemindersResponse {
  reminders: ReminderResponse[];
  surfaceNow: ReminderResponse[];
  nextWindowAt: string | null;
  inAvailabilityWindow: boolean;
}

export interface PushSubscriptionResponse {
  id: string;
  token: string;
  platform: "ios" | "android";
  createdAt: string;
  updatedAt: string;
}
