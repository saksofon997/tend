import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalsCss = readFileSync(join(import.meta.dir, "../../../app/globals.css"), "utf8");
const sceneSource = readFileSync(
  join(import.meta.dir, "../../../components/layout/tend-scene-background.tsx"),
  "utf8",
);

describe("TendSceneBackground sun", () => {
  it("does not paint a high-contrast sunburst from the center", () => {
    expect(globalsCss).not.toContain("conic-gradient");
    expect(globalsCss).not.toMatch(/repeating-conic-gradient/);
    expect(globalsCss).not.toMatch(/at 50% -8%/);
  });

  it("uses a soft oval sun at the top like the mobile scene", () => {
    expect(sceneSource).toContain("tend-scene__sun");
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*top:\s*-90px/);
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*width:\s*360px/);
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*height:\s*220px/);
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*opacity:\s*0\.55/);
    expect(globalsCss).toMatch(/\.tend-scene__sun[\s\S]*border-radius:\s*180px/);
  });
});
