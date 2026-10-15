import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "../../..");
const iconPath = join(webRoot, "app/icon.png");

describe("web app icon", () => {
  it("uses the PNG mark as the favicon source", () => {
    expect(existsSync(iconPath)).toBe(true);
    expect(existsSync(join(webRoot, "app/icon.svg"))).toBe(false);
    const bytes = readFileSync(iconPath);
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
