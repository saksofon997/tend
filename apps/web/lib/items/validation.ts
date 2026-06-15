import { z } from "zod";

const tendItemTypeSchema = z.enum(["must", "want"]);

const lifeAreaSchema = z.enum([
  "household",
  "health",
  "relationships",
  "pets",
  "vehicle",
  "admin",
  "personal",
]);

const rhythmDaysSchema = z
  .number()
  .int("Rhythm must be a whole number of days")
  .min(1, "Rhythm must be at least 1 day")
  .max(365, "Rhythm must be 365 days or fewer");

const optionalIsoDateSchema = z
  .string()
  .datetime({ message: "Use an ISO 8601 date-time string" })
  .transform((value) => new Date(value))
  .optional();

export const createItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  type: tendItemTypeSchema,
  rhythmDays: rhythmDaysSchema,
  lifeArea: lifeAreaSchema.nullable().optional(),
  lastTendedAt: optionalIsoDateSchema,
});

export const updateItemSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    type: tendItemTypeSchema.optional(),
    rhythmDays: rhythmDaysSchema.optional(),
    lifeArea: lifeAreaSchema.nullable().optional(),
    lastTendedAt: z
      .string()
      .datetime()
      .transform((value) => new Date(value))
      .nullable()
      .optional(),
    archived: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const tendItemSchema = z.object({
  tendedAt: optionalIsoDateSchema,
});

export const listItemsQuerySchema = z.object({
  includeArchived: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  lifeArea: lifeAreaSchema.optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type TendItemInput = z.infer<typeof tendItemSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
