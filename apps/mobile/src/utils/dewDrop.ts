import type { TabKey } from "@/utils/tabTransition";

export const DEW_DROP_SIZE = 40;
/** Upward lift, in px, before the drop settles on the next tab. */
export const DEW_DROP_LIFT = -8;
export const DEW_DROP_TRAVEL_MS = 260;

export function dewDropLeft(center: number, size = DEW_DROP_SIZE) {
  return center - size / 2;
}

/** The add control is already a raised drop, so the sliding marker rests elsewhere. */
export function dewDropHidesOnTab(tab: TabKey) {
  return tab === "add";
}

export function dewDropLift(reducedMotion: boolean) {
  return reducedMotion ? 0 : DEW_DROP_LIFT;
}
