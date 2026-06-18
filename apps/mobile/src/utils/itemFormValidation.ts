import { ITEM_NAME_MAX_LENGTH } from "@/constants";
import { rhythmDaysFieldError } from "@/utils/rhythm";
import type { LifeArea, TendItemType } from "@tend/domain";

export interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
}

export function validateItemForm(
  values: ItemFormValues,
  todayDate: string,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    errors.name = "Name is required";
  } else if (trimmedName.length > ITEM_NAME_MAX_LENGTH) {
    errors.name = `Name must be ${ITEM_NAME_MAX_LENGTH} characters or fewer`;
  }

  if (!values.lastTendedDate) {
    errors.lastTendedDate = "Last tended date is required";
  } else if (values.lastTendedDate > todayDate) {
    errors.lastTendedDate = "Last tended cannot be in the future";
  }

  const rhythmError = rhythmDaysFieldError(values.rhythmDays);
  if (rhythmError) {
    errors.rhythmDays = rhythmError;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
