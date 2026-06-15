export type TendItemType = "must" | "want";

export type TendStatus = "fresh" | "getting_stale" | "needs_attention";

export type LifeArea =
  | "household"
  | "health"
  | "relationships"
  | "pets"
  | "vehicle"
  | "admin"
  | "personal";

export interface TendItemInput {
  id: string;
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lastTendedAt: Date | null;
  lifeArea?: LifeArea | null;
  archivedAt?: Date | null;
}

export interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export type ReminderEmphasis = "strong" | "normal";

export type ReminderVisibility = "now" | "next_window";

export interface EligibleReminder {
  item: TendItemInput;
  status: TendStatus;
  daysSinceLastTended: number | null;
  emphasis: ReminderEmphasis;
  visibility: ReminderVisibility;
}

export interface ReminderResult {
  reminders: EligibleReminder[];
  nextWindowAt: Date | null;
  inAvailabilityWindow: boolean;
}

export interface TendPreset {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea;
}
