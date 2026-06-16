export interface TimeWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function normalizeTimeInput(value: string): string {
  const [hours, minutes] = value.split(":");
  return `${hours}:${minutes}`;
}

function toComparableWindows(windows: TimeWindow[]): TimeWindow[] {
  return windows
    .map((window) => ({
      dayOfWeek: window.dayOfWeek,
      startTime: normalizeTimeInput(window.startTime),
      endTime: normalizeTimeInput(window.endTime),
    }))
    .sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        a.startTime.localeCompare(b.startTime) ||
        a.endTime.localeCompare(b.endTime),
    );
}

export function availabilityWindowsEqual(a: TimeWindow[], b: TimeWindow[]): boolean {
  return JSON.stringify(toComparableWindows(a)) === JSON.stringify(toComparableWindows(b));
}
