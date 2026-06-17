import { isValidTimeZone } from "@tend/domain";
import { z } from "zod";

export const updateSettingsSchema = z.object({
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .refine((value) => isValidTimeZone(value), "Timezone must be a valid IANA timezone"),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid settings";
}
