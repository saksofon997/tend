import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { bumpProjectVersion, bumpVersion } from "../bump-version.mjs";

async function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(root, relativePath) {
  const raw = await readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(raw);
}

async function withFixture(callback) {
  const root = await mkdtemp(path.join(tmpdir(), "tend-bump-"));

  try {
    await writeJson(root, "apps/web/package.json", {
      name: "@tend/web",
      version: "1.2.3",
    });
    await writeJson(root, "apps/mobile/package.json", {
      name: "@tend/mobile",
      version: "4.5.6",
    });
    await writeJson(root, "version.json", {
      app: "1.2.3",
      api: "9.8.7",
    });

    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("bumpVersion", () => {
  it("bumps major, minor, and patch semver parts", () => {
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
    expect(bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpVersion("1.2.3", "patch")).toBe("1.2.4");
  });

  it("rejects invalid bump types and versions", () => {
    expect(() => bumpVersion("1.2.3", "build")).toThrow("Expected bump type");
    expect(() => bumpVersion("1.2", "patch")).toThrow("Expected a x.y.z semantic version");
  });
});

describe("bumpProjectVersion", () => {
  it("bumps the web package version and version.json app version together", async () => {
    await withFixture(async (root) => {
      const result = await bumpProjectVersion("web", "minor", { root });

      await expect(readJson(root, "apps/web/package.json")).resolves.toMatchObject({
        version: "1.3.0",
      });
      await expect(readJson(root, "version.json")).resolves.toEqual({
        app: "1.3.0",
        api: "9.8.7",
      });
      expect(result).toMatchObject({
        project: "web",
        previousVersion: "1.2.3",
        nextVersion: "1.3.0",
        changedFiles: ["apps/web/package.json", "version.json"],
      });
    });
  });

  it("bumps the mobile package version without changing web or API versions", async () => {
    await withFixture(async (root) => {
      const result = await bumpProjectVersion("mobile", "major", { root });

      await expect(readJson(root, "apps/mobile/package.json")).resolves.toMatchObject({
        version: "5.0.0",
      });
      await expect(readJson(root, "version.json")).resolves.toEqual({
        app: "1.2.3",
        api: "9.8.7",
      });
      expect(result).toMatchObject({
        project: "mobile",
        previousVersion: "4.5.6",
        nextVersion: "5.0.0",
        changedFiles: ["apps/mobile/package.json"],
      });
    });
  });
});
