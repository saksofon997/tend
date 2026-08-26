import { describe, expect, it } from "bun:test";
import {
  APP_SHELL_HEADER_ROW_CLASS,
  APP_SHELL_NAV_CLASS,
  APP_SHELL_USER_MENU_SLOT_CLASS,
  NAV_ITEMS,
} from "@/components/layout/app-shell";

describe("AppShell responsive header layout", () => {
  it("keeps the account menu pinned to the right before the nav wraps below", () => {
    expect(APP_SHELL_HEADER_ROW_CLASS).toContain("flex-wrap");
    expect(APP_SHELL_HEADER_ROW_CLASS).toContain("md:flex-nowrap");
    expect(APP_SHELL_NAV_CLASS).toContain("order-3");
    expect(APP_SHELL_NAV_CLASS).toContain("w-full");
    expect(APP_SHELL_NAV_CLASS).toContain("md:order-none");
    expect(APP_SHELL_NAV_CLASS).toContain("md:w-auto");
    expect(APP_SHELL_USER_MENU_SLOT_CLASS).toContain("ml-auto");
    expect(APP_SHELL_USER_MENU_SLOT_CLASS).toContain("shrink-0");
  });

  it("puts Reflections in primary nav and keeps History for desktop", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      "/",
      "/check-in",
      "/reflections",
      "/history",
      "/settings/availability",
    ]);
    const history = NAV_ITEMS.find((item) => item.href === "/history");
    expect(history && "hideOnMobile" in history && history.hideOnMobile).toBe(true);
  });
});
