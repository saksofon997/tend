import { dateAtTime, daysBetween, parseTimeToMinutes } from "./time";
import type { AvailabilityWindow } from "./types";

export function findCurrentAvailabilityWindow(
  windows: AvailabilityWindow[],
  now: Date,
): AvailabilityWindow | null {
  if (windows.length === 0) {
    return null;
  }

  const dayOfWeek = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  return (
    windows.find((window) => {
      if (window.dayOfWeek !== dayOfWeek) {
        return false;
      }

      const start = parseTimeToMinutes(window.startTime);
      const end = parseTimeToMinutes(window.endTime);
      return minutesNow >= start && minutesNow < end;
    }) ?? null
  );
}

export function isInAvailabilityWindow(windows: AvailabilityWindow[], now: Date): boolean {
  return findCurrentAvailabilityWindow(windows, now) !== null;
}

/** True when a previous send already happened inside the window that contains `now`. */
export function wasNotifiedInCurrentAvailabilityWindow(
  windows: AvailabilityWindow[],
  lastNotifiedAt: Date | null,
  now: Date,
): boolean {
  if (!lastNotifiedAt) {
    return false;
  }

  const current = findCurrentAvailabilityWindow(windows, now);
  if (!current) {
    return false;
  }

  const start = dateAtTime(now, parseTimeToMinutes(current.startTime));
  const end = dateAtTime(now, parseTimeToMinutes(current.endTime));
  return lastNotifiedAt.getTime() >= start.getTime() && lastNotifiedAt.getTime() < end.getTime();
}

export function findNextAvailabilityWindow(windows: AvailabilityWindow[], now: Date): Date | null {
  if (windows.length === 0) {
    return null;
  }

  let next: Date | null = null;

  for (let dayOffset = 0; dayOffset < 8; dayOffset += 1) {
    const candidateDay = new Date(now);
    candidateDay.setDate(candidateDay.getDate() + dayOffset);
    const dayOfWeek = candidateDay.getDay();
    const minutesNow =
      dayOffset === 0 ? now.getHours() * 60 + now.getMinutes() : Number.NEGATIVE_INFINITY;

    for (const window of windows) {
      if (window.dayOfWeek !== dayOfWeek) {
        continue;
      }

      const startMinutes = parseTimeToMinutes(window.startTime);
      if (startMinutes <= minutesNow) {
        continue;
      }

      const candidate = dateAtTime(candidateDay, startMinutes);
      if (!next || candidate.getTime() < next.getTime()) {
        next = candidate;
      }
    }
  }

  return next;
}

export function minutesUntilAvailability(windows: AvailabilityWindow[], now: Date): number | null {
  if (isInAvailabilityWindow(windows, now)) {
    return 0;
  }

  const next = findNextAvailabilityWindow(windows, now);
  if (!next) {
    return null;
  }

  return Math.max(0, daysBetween(now, next) * 24 * 60 + (next.getTime() - now.getTime()) / 60000);
}
