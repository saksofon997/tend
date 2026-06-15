import type { ItemFormValues } from "@/components/forms/item-form";
import { z } from "zod";

export const itemFormClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  type: z.enum(["must", "want"]),
  rhythmDays: z.number(),
  lifeArea: z.string().nullable(),
  lastTendedDate: z.string().min(1, "Last tended date is required"),
});

export function validateItemForm(
  values: ItemFormValues,
  todayDate: string,
): Record<string, string> | null {
  const parsed = itemFormClientSchema.safeParse(values);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return errors;
  }

  if (values.lastTendedDate > todayDate) {
    return { lastTendedDate: "Last tended cannot be in the future" };
  }

  return null;
}
