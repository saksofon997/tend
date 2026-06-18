import { isoToDateInputValue } from "@/constants";
import type { ItemResponse } from "@/types";
import type { LifeArea, TendItemType } from "@tend/domain";

export interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
}

export function itemFormValuesFromItem(item: ItemResponse): ItemFormValues {
  return {
    name: item.name,
    type: item.type,
    rhythmDays: item.rhythmDays,
    lifeArea: item.lifeArea,
    lastTendedDate: isoToDateInputValue(item.lastTendedAt),
  };
}
