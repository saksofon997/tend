import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("autonomous agent setup", () => {
  test("PRODUCT.md stays the product register for design tools", () => {
    const product = read("PRODUCT.md");
    expect(product).toContain("## Register");
    expect(product).toMatch(/product/i);
    expect(product).toContain("Anti-references");
  });

  test("DESIGN.md points at docs/design instead of a second system", () => {
    const design = read("DESIGN.md");
    expect(design).toContain("docs/design/");
    expect(design).toContain("PRODUCT.md");
  });

  test("impeccable skill is vendored and Tend-constrained", () => {
    const skill = read(".cursor/skills/impeccable/SKILL.md");
    expect(skill).toContain("adapt");
    expect(skill).toContain("polish");
    expect(skill).toContain("Do not");
    expect(skill).toContain("init");
    expect(skill).toContain("bolder");
    expect(skill).toContain("docs/design/");
  });

  test("change instructions send agents through autonomy and impeccable", () => {
    const instructions = read(".cursor/skills/tend-change-instructions/SKILL.md");
    expect(instructions).toContain("autonomy.mdc");
    expect(instructions).toContain(".cursor/skills/impeccable/SKILL.md");
    expect(read(".codex/skills/tend-change-instructions/SKILL.md")).toContain("autonomy.mdc");
  });

  test("EAS preview workflow triggers Android preview builds from main", () => {
    const workflow = read(".github/workflows/eas-preview.yml");
    expect(workflow).toContain("EXPO_TOKEN");
    expect(workflow).toContain("--profile preview");
    expect(workflow).toContain("--platform android");
    expect(workflow).toContain("apps/mobile");
    expect(workflow).not.toContain("--platform ios");
    expect(workflow).not.toContain("--platform all");
  });

  test("auto-merge workflow squash-merges ready PRs and skips product gates", () => {
    const workflow = read(".github/workflows/automerge.yml");
    expect(workflow).toContain("--auto --squash");
    expect(workflow).toContain("needs-product-decision");
    expect(workflow).toContain("github.event.pull_request.draft == false");
    expect(read(".github/workflows/ci.yml")).toContain("name: CI");
    expect(read("docs/github-setup.md")).toContain("EXPO_TOKEN");
    expect(read("docs/github-setup.md")).toContain("settings/secrets/actions");
  });
});
