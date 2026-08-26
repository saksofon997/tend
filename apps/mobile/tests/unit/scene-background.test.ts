import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const mobileRoot = join(import.meta.dir, "../..");
const sceneSource = readFileSync(join(mobileRoot, "src/components/scene-background.tsx"), "utf8");
const portraitFile = join(mobileRoot, "assets/scene/tend-scene-portrait.webp");
const splashSource = readFileSync(join(mobileRoot, "App.tsx"), "utf8");

describe("SceneBackground", () => {
  it("covers the screen with the portrait meadow illustration", () => {
    expect(sceneSource).toContain("tend-scene-portrait.webp");
    expect(sceneSource).toContain('resizeMode="cover"');
    expect(sceneSource).not.toContain("react-native-svg");
    expect(existsSync(portraitFile)).toBe(true);
    expect(statSync(portraitFile).size).toBeGreaterThan(10_000);
  });

  it("paints the splash screen as well as signed-in and auth shells", () => {
    expect(splashSource).toContain("<SceneBackground />");
    expect(splashSource.match(/<SceneBackground \/>/g)?.length).toBeGreaterThanOrEqual(4);
  });
});
