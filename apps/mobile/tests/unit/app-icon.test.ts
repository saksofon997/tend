import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mobileRoot = join(import.meta.dir, "../..");
const config = readFileSync(join(mobileRoot, "app.config.js"), "utf8");
const iconPath = join(mobileRoot, "assets/app-icon.png");

describe("mobile app icon", () => {
  it("points Expo at a PNG mark on the parchment background", () => {
    expect(config).toContain('icon: "./assets/app-icon.png"');
    expect(config).toContain('foregroundImage: "./assets/app-icon.png"');
    expect(config).toContain('backgroundColor: "#F3EAD6"');
    expect(existsSync(iconPath)).toBe(true);
    const bytes = readFileSync(iconPath);
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
