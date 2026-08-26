import { describe, expect, it } from "bun:test";
import { nextShellHeaderCollapseState } from "@/lib/layout/shell-header-collapse";

describe("nextShellHeaderCollapseState", () => {
  it("does not collapse the header on wide viewports", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: false,
      isCompactViewport: false,
      menuOpen: false,
      previousScrollY: 0,
      scrollY: 240,
    });

    expect(next.collapsed).toBe(false);
  });

  it("collapses the compact header after scrolling down past the direction threshold", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: false,
      isCompactViewport: true,
      menuOpen: false,
      previousScrollY: 16,
      scrollY: 48,
    });

    expect(next.collapsed).toBe(true);
  });

  it("reveals the compact header when scrolling up", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: true,
      isCompactViewport: true,
      menuOpen: false,
      previousScrollY: 180,
      scrollY: 140,
    });

    expect(next.collapsed).toBe(false);
  });

  it("keeps the compact header visible near the top of the page", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: true,
      isCompactViewport: true,
      menuOpen: false,
      previousScrollY: 24,
      scrollY: 4,
    });

    expect(next.collapsed).toBe(false);
  });

  it("ignores compact scroll jitter smaller than the direction threshold", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: true,
      isCompactViewport: true,
      menuOpen: false,
      previousScrollY: 160,
      scrollY: 164,
    });

    expect(next.collapsed).toBe(true);
    expect(next.previousScrollY).toBe(160);
  });

  it("keeps the compact header visible while the account menu is open", () => {
    const next = nextShellHeaderCollapseState({
      collapsed: false,
      isCompactViewport: true,
      menuOpen: true,
      previousScrollY: 16,
      scrollY: 80,
    });

    expect(next.collapsed).toBe(false);
  });
});
