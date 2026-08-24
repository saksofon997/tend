import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sceneSource = readFileSync(
  join(import.meta.dir, "../../src/components/scene-background.tsx"),
  "utf8",
);

describe("SceneBackground", () => {
  it("places the sun wash in the top-left with sunrays", () => {
    expect(sceneSource).toContain("left: -90");
    expect(sceneSource).toContain("top: -140");
    expect(sceneSource).toContain("styles.sunrays");
  });

  it("draws the shared grass blade path", () => {
    expect(sceneSource).toContain(
      "M86 160c8-46 4-92-18-148M104 160c2-40 14-86 42-128M118 160c-6-38-22-78-12-132",
    );
  });
});
