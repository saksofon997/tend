export const TAB_ORDER = ["home", "activity", "add", "availability", "settings"] as const;

export type TabKey = (typeof TAB_ORDER)[number];
export type TabTransition = {
  axis: "x" | "y";
  enterOffset: number;
  exitOffset: number;
};

const TAB_HORIZONTAL_OFFSET = 18;
const ADD_TAB_ENTER_OFFSET = 36;
const ADD_TAB_EXIT_OFFSET = 12;

export function getTabSwitchDirection(from: TabKey, to: TabKey): -1 | 0 | 1 {
  const fromIndex = TAB_ORDER.indexOf(from);
  const toIndex = TAB_ORDER.indexOf(to);

  if (fromIndex === toIndex) {
    return 0;
  }

  return toIndex > fromIndex ? 1 : -1;
}

export function getTabTransition(from: TabKey, to: TabKey): TabTransition {
  if (from === to) {
    return { axis: "x", enterOffset: 0, exitOffset: 0 };
  }

  if (to === "add") {
    return {
      axis: "y",
      enterOffset: ADD_TAB_ENTER_OFFSET,
      exitOffset: -ADD_TAB_EXIT_OFFSET,
    };
  }

  if (from === "add") {
    return {
      axis: "y",
      enterOffset: ADD_TAB_EXIT_OFFSET,
      exitOffset: ADD_TAB_ENTER_OFFSET,
    };
  }

  const direction = getTabSwitchDirection(from, to);

  return {
    axis: "x",
    enterOffset: direction * TAB_HORIZONTAL_OFFSET,
    exitOffset: direction * -TAB_HORIZONTAL_OFFSET,
  };
}

export function resolveHardwareBackAction(activeTab: TabKey): {
  consume: true;
  nextTab?: TabKey;
} {
  if (activeTab === "home") {
    return { consume: true };
  }

  return { consume: true, nextTab: "home" };
}
