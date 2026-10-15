import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const globalsCss = readFileSync(path.join(import.meta.dir, "../../../app/globals.css"), "utf8");
const tokensCss = readFileSync(
  path.join(import.meta.dir, "../../../../../docs/design/tokens.css"),
  "utf8",
);

describe("reflection paper", () => {
  it("rules the writing on the Newsreader baseline", () => {
    expect(tokensCss).toContain("--tend-paper-baseline:");
    expect(tokensCss).toContain("0.735");
    expect(globalsCss).toContain("var(--tend-paper-baseline)");
    expect(globalsCss).toContain("background-attachment: local");
    expect(globalsCss).toContain("background-origin: content-box");
  });

  it("does not draw the margin rule beside the writing", () => {
    expect(globalsCss).not.toContain("var(--tend-paper-margin)");
  });
});
