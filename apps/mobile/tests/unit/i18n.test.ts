import { describe, expect, it } from "bun:test";
import { lifeAreaFilterToggleLabel, t } from "../../src/i18n";

describe("mobile i18n", () => {
  it("uses web-aligned status labels", () => {
    expect(t("status.fresh")).toBe("Fresh");
    expect(t("sections.lookingGood")).toBe("Looking good");
  });

  it("uses web-aligned empty state copy", () => {
    expect(t("home.empty.title")).toBe("Nothing to tend yet");
    expect(t("activity.empty.title")).toBe("No tending logged yet");
  });

  it("formats life area filter toggle labels like web", () => {
    expect(lifeAreaFilterToggleLabel(null)).toBe("Filter by area?");
    expect(lifeAreaFilterToggleLabel("health")).toBe("Filter by area · Health");
  });

  it("uses web-aligned add item copy", () => {
    expect(t("items.add.suggestions.button")).toBe("Need ideas?");
    expect(t("items.add.type.must.hint")).toBe(
      "Use must sparingly for things that truly cannot drift.",
    );
    expect(t("items.add.rhythm.custom")).toBe("Custom interval");
  });

  it("uses web-aligned onboarding copy", () => {
    expect(t("onboarding.welcome.title")).toBe("Welcome to Tend");
    expect(t("onboarding.choose.title")).toBe("What do you want to tend first?");
    expect(t("onboarding.choose.description")).toBe(
      "Write your own, pick a suggestion, or skip and look around first.",
    );
    expect(t("onboarding.preset.title")).toBe("Pick a suggestion");
    expect(t("onboarding.form.save")).toBe("Save and continue");
  });
});
