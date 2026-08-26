export const TAB_ORDER = ["home", "reflections", "add", "checkIn", "settings"] as const;

export type TabKey = (typeof TAB_ORDER)[number];
export type AppScreenKey = TabKey | "activity";
export type TabTransition = {
  axis: "x" | "y";
  enterOffset: number;
  exitOffset: number;
};
export type TabTransitionTarget = TabTransition & {
  renderedTab: AppScreenKey;
};

const TAB_HORIZONTAL_OFFSET = 18;
const ADD_TAB_ENTER_OFFSET = 36;
const ADD_TAB_EXIT_OFFSET = 12;

function asTabKey(screen: AppScreenKey): TabKey {
  return screen === "activity" ? "checkIn" : screen;
}

export function getTabSwitchDirection(from: AppScreenKey, to: AppScreenKey): -1 | 0 | 1 {
  const fromIndex = TAB_ORDER.indexOf(asTabKey(from));
  const toIndex = TAB_ORDER.indexOf(asTabKey(to));

  if (fromIndex === toIndex) {
    return from === to ? 0 : 1;
  }

  return toIndex > fromIndex ? 1 : -1;
}

export function getTabTransition(from: AppScreenKey, to: AppScreenKey): TabTransition {
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

export function getTabTransitionTarget(from: AppScreenKey, to: AppScreenKey): TabTransitionTarget {
  return {
    ...getTabTransition(from, to),
    renderedTab: to,
  };
}

export function resolveHardwareBackAction(activeTab: AppScreenKey): {
  consume: true;
  nextTab?: AppScreenKey;
} {
  if (activeTab === "home") {
    return { consume: true };
  }

  if (activeTab === "activity") {
    return { consume: true, nextTab: "checkIn" };
  }

  return { consume: true, nextTab: "home" };
}
