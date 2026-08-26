import { REFLECTION_BODY_MAX_LENGTH, isCalendarDate } from "@tend/domain";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((value) => isCalendarDate(value), "Use a real calendar date");

export const listReflectionsQuerySchema = z
  .object({
    from: z.preprocess(emptyToUndefined, calendarDateSchema.optional()),
    to: z.preprocess(emptyToUndefined, calendarDateSchema.optional()),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "from must be on or before to",
    path: ["from"],
  });

export const upsertReflectionSchema = z.object({
  body: z
    .string()
    .max(
      REFLECTION_BODY_MAX_LENGTH,
      `Keep this leaf to ${REFLECTION_BODY_MAX_LENGTH} characters or fewer`,
    ),
});

export type ListReflectionsQuery = z.infer<typeof listReflectionsQuerySchema>;
export type UpsertReflectionInput = z.infer<typeof upsertReflectionSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
