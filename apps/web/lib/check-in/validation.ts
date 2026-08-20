import { CHECK_IN_PERIODS, type CheckInPeriod, isCheckInPeriod } from "@tend/domain";
import { z } from "zod";

export const DEFAULT_CHECK_IN_PERIOD: CheckInPeriod = "week";
export const CHECK_IN_EVENT_LIMIT = 500;

export const checkInQuerySchema = z.object({
  period: z.enum(CHECK_IN_PERIODS).optional().default(DEFAULT_CHECK_IN_PERIOD),
});

export function parseCheckInPeriod(value: string | null | undefined): CheckInPeriod {
  if (value && isCheckInPeriod(value)) {
    return value;
  }

  return DEFAULT_CHECK_IN_PERIOD;
}

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
