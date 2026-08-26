import { useEffect, useRef, useState } from "react";

export const SHELL_HEADER_COLLAPSE_BREAKPOINT_PX = 768;
export const SHELL_HEADER_TOP_REVEAL_PX = 8;
export const SHELL_HEADER_DIRECTION_THRESHOLD_PX = 8;

export function nextShellHeaderCollapseState(input: {
  collapsed: boolean;
  isCompactViewport: boolean;
  menuOpen: boolean;
  previousScrollY: number;
  scrollY: number;
}): { collapsed: boolean; previousScrollY: number } {
  // Desktop keeps a pinned bar; compact web folds it away so the meadow and content can use the screen.
  if (!input.isCompactViewport || input.menuOpen) {
    return { collapsed: false, previousScrollY: input.scrollY };
  }

  if (input.scrollY <= SHELL_HEADER_TOP_REVEAL_PX) {
    return { collapsed: false, previousScrollY: input.scrollY };
  }

  const delta = input.scrollY - input.previousScrollY;
  if (Math.abs(delta) < SHELL_HEADER_DIRECTION_THRESHOLD_PX) {
    return { collapsed: input.collapsed, previousScrollY: input.previousScrollY };
  }

  return { collapsed: delta > 0, previousScrollY: input.scrollY };
}

export function useShellHeaderCollapsed(menuOpen: boolean) {
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);
  const previousScrollY = useRef(0);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${SHELL_HEADER_COLLAPSE_BREAKPOINT_PX - 1}px)`);

    function update() {
      const next = nextShellHeaderCollapseState({
        collapsed: collapsedRef.current,
        isCompactViewport: media.matches,
        menuOpen,
        previousScrollY: previousScrollY.current,
        scrollY: window.scrollY,
      });
      previousScrollY.current = next.previousScrollY;
      collapsedRef.current = next.collapsed;
      setCollapsed(next.collapsed);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, [menuOpen]);

  return collapsed;
}
