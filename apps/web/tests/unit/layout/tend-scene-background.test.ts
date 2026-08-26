import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  SCENE_ART_LANDSCAPE_SRC,
  SCENE_ART_PORTRAIT_SRC,
} from "@/components/layout/tend-scene-background";

const webRoot = join(import.meta.dir, "../../..");
const globalsCss = readFileSync(join(webRoot, "app/globals.css"), "utf8");
const sceneSource = readFileSync(
  join(webRoot, "components/layout/tend-scene-background.tsx"),
  "utf8",
);
const mobileSceneSource = readFileSync(
  join(webRoot, "../../apps/mobile/src/components/scene-background.tsx"),
  "utf8",
);
const landscapeFile = join(webRoot, "public/scene/tend-scene-landscape.webp");
const portraitFile = join(webRoot, "public/scene/tend-scene-portrait.webp");

describe("TendSceneBackground", () => {
  it("does not paint a high-contrast sunburst from the center", () => {
    expect(globalsCss).not.toMatch(/at 50% -8%/);
    expect(globalsCss).not.toMatch(/left:\s*50%/);
    expect(globalsCss).not.toMatch(/transform:\s*translateX\(-50%\)/);
  });

  it("covers the viewport with illustrated meadow art anchored to the bottom-left", () => {
    expect(sceneSource).toContain("tend-scene__art");
    expect(globalsCss).toMatch(/\.tend-scene__art[\s\S]*object-fit:\s*cover/);
    expect(globalsCss).toMatch(/\.tend-scene__art[\s\S]*object-position:\s*left bottom/);
  });

  it("uses landscape art by default and portrait art on tall viewports", () => {
    expect(SCENE_ART_LANDSCAPE_SRC).toBe("/scene/tend-scene-landscape.webp");
    expect(SCENE_ART_PORTRAIT_SRC).toBe("/scene/tend-scene-portrait.webp");
    expect(sceneSource).toContain(SCENE_ART_LANDSCAPE_SRC);
    expect(sceneSource).toContain(SCENE_ART_PORTRAIT_SRC);
    expect(sceneSource).toContain("(orientation: portrait)");
    expect(existsSync(landscapeFile)).toBe(true);
    expect(existsSync(portraitFile)).toBe(true);
    expect(statSync(landscapeFile).size).toBeGreaterThan(10_000);
    expect(statSync(portraitFile).size).toBeGreaterThan(10_000);
  });

  it("keeps the same portrait meadow on mobile", () => {
    expect(mobileSceneSource).toContain("tend-scene-portrait.webp");
    expect(mobileSceneSource).not.toContain("react-native-svg");
  });
});
