import { z } from "zod";

const optionalIsoDateSchema = z
  .string()
  .datetime({ message: "Use an ISO 8601 date-time string" })
  .transform((value) => new Date(value));

export const updateEventSchema = z.object({
  tendedAt: optionalIsoDateSchema,
});

export const listActivityQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be 100 or fewer")
    .optional()
    .default(50),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
