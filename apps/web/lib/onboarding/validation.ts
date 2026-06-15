import { z } from "zod";

export const completeOnboardingSchema = z.object({
  completed: z.literal(true),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}
