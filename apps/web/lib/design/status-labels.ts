import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";

export const TYPE_LABELS: Record<TendItemType, string> = {
  want: "Want",
  must: "Must",
};

export const LIFE_AREA_LABELS: Record<LifeArea, string> = {
  household: "Household",
  health: "Health",
  relationships: "Relationships",
  pets: "Pets",
  vehicle: "Vehicle",
  life_admin: "Life admin",
  self_care: "Self-care",
  finance: "Finance",
  food_kitchen: "Food & kitchen",
  home_maintenance: "Home maintenance",
  outdoor: "Outdoor",
  kids_family: "Kids & family",
  personal: "Personal",
};

export function statusStyles(status: TendStatus) {
  const map = {
    fresh: {
      text: "text-[var(--tend-status-fresh)]",
      bg: "bg-[var(--tend-status-fresh-bg)]",
    },
    getting_stale: {
      text: "text-[var(--tend-status-stale)]",
      bg: "bg-[var(--tend-status-stale-bg)]",
    },
    needs_attention: {
      text: "text-[var(--tend-status-attention)]",
      bg: "bg-[var(--tend-status-attention-bg)]",
    },
  } as const;

  return map[status];
}

export function typeStyles(type: TendItemType) {
  const map = {
    want: {
      text: "text-[var(--tend-type-want)]",
      bg: "bg-[var(--tend-type-want-bg)]",
      border: "border-[var(--tend-type-want-border)]",
    },
    must: {
      text: "text-[var(--tend-type-must)]",
      bg: "bg-[var(--tend-type-must-bg)]",
      border: "border-[var(--tend-type-must-border)]",
    },
  } as const;

  return map[type];
}
