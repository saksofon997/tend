import type { AvailabilityWindowRow } from "@tend/db";
import { normalizeTimeFromDb } from "@tend/db";
import type { AvailabilityWindow } from "@tend/domain";

export interface AvailabilityWindowResponse {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function serializeAvailabilityWindow(
  row: AvailabilityWindowRow,
): AvailabilityWindowResponse {
  return {
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    startTime: normalizeTimeFromDb(row.startTime),
    endTime: normalizeTimeFromDb(row.endTime),
  };
}

export function toDomainAvailabilityWindow(row: AvailabilityWindowRow): AvailabilityWindow {
  return {
    dayOfWeek: row.dayOfWeek,
    startTime: normalizeTimeFromDb(row.startTime),
    endTime: normalizeTimeFromDb(row.endTime),
  };
}
