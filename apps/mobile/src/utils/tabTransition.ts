export const TAB_ORDER = ["home", "activity", "add", "availability", "settings"] as const;

export type TabKey = (typeof TAB_ORDER)[number];

export function getTabSwitchDirection(from: TabKey, to: TabKey): -1 | 0 | 1 {
  const fromIndex = TAB_ORDER.indexOf(from);
  const toIndex = TAB_ORDER.indexOf(to);

  if (fromIndex === toIndex) {
    return 0;
  }

  return toIndex > fromIndex ? 1 : -1;
}
