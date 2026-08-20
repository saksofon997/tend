import { describe, expect, it } from "bun:test";
import { colors } from "@/theme";

describe("theme colors", () => {
  it("uses the same warm linen page background as the web app", () => {
    expect(colors.bg).toBe("#f7f5f2");
  });

  it("keeps the outdoor scene wash quieter than a centered spotlight", () => {
    expect(colors.sun).toBe("rgba(255, 220, 160, 0.22)");
    expect(colors.sunSoft).toBe("rgba(255, 232, 196, 0.12)");
    expect(colors.grass).toBe("#7a9270");
  });
});
