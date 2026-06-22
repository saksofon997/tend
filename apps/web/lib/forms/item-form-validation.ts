import type { ItemFormValues } from "@/components/forms/item-form";
import { rhythmDaysFieldError } from "@/lib/forms/rhythm";
import { ITEM_NAME_MAX_LENGTH } from "@/lib/items/constants";
import { z } from "zod";

export const itemFormClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(ITEM_NAME_MAX_LENGTH, `Name must be ${ITEM_NAME_MAX_LENGTH} characters or fewer`),
  type: z.enum(["must", "want"]),
  rhythmDays: z.number(),
  lifeArea: z.string().nullable(),
  lastTendedDate: z.string().min(1, "Last tended date is required"),
  sharedWithEmail: z.string().trim().email("Enter a valid friend email address").or(z.literal("")),
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

  const rhythmError = rhythmDaysFieldError(values.rhythmDays);
  if (rhythmError) {
    return { rhythmDays: rhythmError };
  }

  return null;
}
