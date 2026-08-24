import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalsCss = readFileSync(join(import.meta.dir, "../../../app/globals.css"), "utf8");
const sceneSource = readFileSync(
  join(import.meta.dir, "../../../components/layout/tend-scene-background.tsx"),
  "utf8",
);
const mobileSceneSource = readFileSync(
  join(import.meta.dir, "../../../../../apps/mobile/src/components/scene-background.tsx"),
  "utf8",
);

describe("TendSceneBackground sun", () => {
  it("does not paint a high-contrast sunburst from the center", () => {
    expect(globalsCss).not.toMatch(/at 50% -8%/);
    expect(globalsCss).not.toMatch(/left:\s*50%/);
    expect(globalsCss).not.toMatch(/transform:\s*translateX\(-50%\)/);
  });

  it("washes the sun from the top-left corner with low-contrast rays", () => {
    expect(sceneSource).toContain("tend-scene__sun");
    expect(sceneSource).toContain("tend-scene__sunrays");
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*at 0% 0%/);
    expect(globalsCss).toMatch(/\.tend-scene__sunrays[\s\S]*left:\s*0/);
    expect(globalsCss).toMatch(/\.tend-scene__sunrays[\s\S]*top:\s*0/);
  });

  it("uses the same grass blades as the mobile scene", () => {
    const grassPath =
      "M86 160c8-46 4-92-18-148M104 160c2-40 14-86 42-128M118 160c-6-38-22-78-12-132M312 160c10-42 2-96-22-142M328 160c4-48 18-90 48-126M538 160c-8-50 6-98 28-140M556 160c8-44-6-88-28-132M572 160c2-52 16-94 44-130M864 160c-10-46 4-94 26-138M882 160c6-40-8-86-24-128M1088 160c8-48-4-96-26-140M1106 160c4-42 16-88 40-124M1120 160c-6-38-18-82-8-126";

    expect(sceneSource).toContain(grassPath);
    expect(mobileSceneSource).toContain(grassPath);
    expect(globalsCss).toMatch(/\.tend-scene__grass[\s\S]*opacity:\s*0\.35/);
  });
});
