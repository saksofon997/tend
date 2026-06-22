import { ITEM_NAME_MAX_LENGTH } from "@/constants";
import { rhythmDaysFieldError } from "@/utils/rhythm";
import { t } from "@i18n";
import type { LifeArea, TendItemType } from "@tend/domain";

export interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
  sharedWithEmail: string;
}

export function validateItemForm(
  values: ItemFormValues,
  todayDate: string,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    errors.name = t("errors.item.nameRequired");
  } else if (trimmedName.length > ITEM_NAME_MAX_LENGTH) {
    errors.name = t("errors.item.nameTooLong", { max: ITEM_NAME_MAX_LENGTH });
  }

  if (!values.lastTendedDate) {
    errors.lastTendedDate = t("errors.item.lastTendedRequired");
  } else if (values.lastTendedDate > todayDate) {
    errors.lastTendedDate = t("errors.item.lastTendedFuture");
  }

  const rhythmError = rhythmDaysFieldError(values.rhythmDays);
  if (rhythmError) {
    errors.rhythmDays = rhythmError;
  }

  const sharedWithEmail = values.sharedWithEmail.trim();
  if (sharedWithEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedWithEmail)) {
    errors.sharedWithEmail = t("errors.item.friendEmailInvalid");
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
