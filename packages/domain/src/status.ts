import { calendarDaysBetween, daysBetween } from "./time";
import type { TendStatus } from "./types";

export interface StatusInput {
  lastTendedAt: Date | null;
  rhythmDays: number;
  now: Date;
}

export function computeStatus({ lastTendedAt, rhythmDays, now }: StatusInput): TendStatus {
  if (rhythmDays <= 0) {
    return "needs_attention";
  }

  if (lastTendedAt === null) {
    return "needs_attention";
  }

  const daysSince = daysBetween(lastTendedAt, now);
  if (daysSince < 0) {
    return "fresh";
  }

  if (daysSince <= rhythmDays * 0.5) {
    return "fresh";
  }

  if (daysSince <= rhythmDays) {
    return "getting_stale";
  }

  return "needs_attention";
}

export function daysSinceLastTended(lastTendedAt: Date | null, now: Date): number | null {
  if (lastTendedAt === null) {
    return null;
  }

  return Math.max(0, calendarDaysBetween(lastTendedAt, now));
}
