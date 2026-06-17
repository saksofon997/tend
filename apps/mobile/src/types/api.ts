import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";

export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface ItemResponse {
  id: string;
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedAt: string | null;
  status: TendStatus;
  daysSinceLastTended: number | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
