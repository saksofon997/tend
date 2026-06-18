import { RHYTHM_MAX_DAYS, RHYTHM_MIN_DAYS } from "@/constants";
import { t } from "@i18n";

export const RHYTHM_CUSTOM_SELECT_VALUE = "custom";

export function rhythmDaysFieldError(days: number): string | null {
  if (!Number.isInteger(days)) {
    return t("errors.item.rhythmInteger");
  }

  if (days < RHYTHM_MIN_DAYS) {
    return t("errors.item.rhythmMin");
  }

  if (days > RHYTHM_MAX_DAYS) {
    return t("errors.item.rhythmMax");
  }

  return null;
}
