import { parseTimeToMinutes } from "@tend/domain";
import { z } from "zod";

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format (e.g. 09:00)");

const availabilityWindowSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int("Day of week must be a whole number")
      .min(0, "Day of week must be between 0 (Sunday) and 6 (Saturday)")
      .max(6, "Day of week must be between 0 (Sunday) and 6 (Saturday)"),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .superRefine((window, ctx) => {
    const start = parseTimeToMinutes(window.startTime);
    const end = parseTimeToMinutes(window.endTime);

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

export const replaceAvailabilitySchema = z.object({
  windows: z.array(availabilityWindowSchema),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
