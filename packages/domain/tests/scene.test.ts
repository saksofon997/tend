import { describe, expect, it } from "bun:test";
import {
  SCENE_GRASS_BLADES,
  SCENE_HEIGHT,
  SCENE_SUN,
  SCENE_SUN_RAYS,
  SCENE_WIDTH,
  sceneSunOriginIsUpperLeft,
} from "../src/scene";

describe("outdoor scene", () => {
  it("places the sun off the top-left so light comes from one angle", () => {
    expect(sceneSunOriginIsUpperLeft()).toBe(true);
    expect(SCENE_SUN.originX).toBeLessThan(SCENE_WIDTH / 4);
    expect(SCENE_SUN.originY).toBeLessThan(0);
  });

  it("keeps sunrays quiet and irregular instead of a repeating halo", () => {
    expect(SCENE_SUN_RAYS.length).toBeGreaterThanOrEqual(12);
    expect(Math.max(...SCENE_SUN_RAYS.map((ray) => ray.opacity))).toBeLessThanOrEqual(0.08);

    const origin = `M${SCENE_SUN.originX} ${SCENE_SUN.originY}`;
    expect(SCENE_SUN_RAYS.every((ray) => ray.d.startsWith(origin))).toBe(true);

    const lengths = SCENE_SUN_RAYS.map((ray) => ray.d.length);
    expect(new Set(lengths).size).toBeGreaterThan(3);
  });

  it("draws a denser grass verge across the full width", () => {
    expect(SCENE_GRASS_BLADES.length).toBeGreaterThanOrEqual(40);
    expect(Math.max(...SCENE_GRASS_BLADES.map((blade) => blade.opacity))).toBeLessThanOrEqual(0.32);

    const startXs = SCENE_GRASS_BLADES.map((blade) => Number(blade.d.split(" ")[0]?.slice(1)));
    expect(Math.min(...startXs)).toBeLessThan(40);
    expect(Math.max(...startXs)).toBeGreaterThan(SCENE_WIDTH - 50);
    expect(SCENE_GRASS_BLADES.every((blade) => blade.d.includes(` ${SCENE_HEIGHT}C`))).toBe(true);
  });
});
