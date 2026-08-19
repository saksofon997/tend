import { isCalendarDate } from "@tend/domain";
import { z } from "zod";

const optionalIsoDateSchema = z
  .string()
  .datetime({ message: "Use an ISO 8601 date-time string" })
  .transform((value) => new Date(value));

export const updateEventSchema = z.object({
  tendedAt: optionalIsoDateSchema,
});

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((value) => isCalendarDate(value), "Use a real calendar date");

export const listActivityQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must be 100 or fewer")
      .optional()
      .default(50),
    q: z.preprocess(
      emptyToUndefined,
      z.string().max(100, "Search must be 100 characters or fewer").optional(),
    ),
    type: z.preprocess(emptyToUndefined, z.enum(["must", "want"]).optional()),
    from: z.preprocess(emptyToUndefined, calendarDateSchema.optional()),
    to: z.preprocess(emptyToUndefined, calendarDateSchema.optional()),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "from must be on or before to",
    path: ["from"],
  });

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;

export function activityFilterBounds(from?: string, to?: string): { from?: Date; to?: Date } {
  return {
    from: from ? new Date(`${from}T00:00:00.000Z`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
  };
}

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
