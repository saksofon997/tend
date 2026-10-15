import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { colors, dew, fonts } from "@/theme";

const fontDir = join(import.meta.dir, "../../assets/fonts");

describe("theme colors", () => {
  it("uses the parchment page background shared with the web app", () => {
    expect(colors.bg).toBe("#E8DDCA");
    expect(colors.card).toBe("#F4EDE1");
    expect(colors.text).toBe("#3F382F");
    expect(colors.primary).toBe("#596D55");
  });

  it("uses the journal paper colors from the design tokens", () => {
    expect(colors.paper).toBe("#EEE5D7");
    expect(colors.paperLine).toBe("#D7CCBA");
    expect(colors.paperMargin).toBe("#B88F86");
  });

  it("keeps dew surfaces translucent and warm", () => {
    expect(dew.surface).toBe("rgba(248, 242, 232, 0.58)");
    expect(dew.surfaceStrong).toBe("rgba(248, 242, 232, 0.78)");
    expect(dew.fallback).toBe("#F8F2E8");
  });
});

describe("theme fonts", () => {
  it("loads Newsreader for display and DM Sans for UI", () => {
    expect(fonts.display).toBe("Newsreader_500Medium");
    expect(fonts.body).toBe("DMSans_400Regular");
    expect(existsSync(join(fontDir, "Newsreader_400Regular.ttf"))).toBe(true);
    expect(existsSync(join(fontDir, "DMSans_600SemiBold.ttf"))).toBe(true);
  });
});
