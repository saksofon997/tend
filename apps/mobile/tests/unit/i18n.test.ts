import { describe, expect, it } from "bun:test";
import { getLocale, lifeAreaFilterToggleLabel, setLocale, t } from "../../src/i18n";

describe("mobile i18n", () => {
  it("uses web-aligned status labels", () => {
    setLocale("en");
    expect(t("status.fresh")).toBe("Fresh");
    expect(t("sections.lookingGood")).toBe("Looking good");
  });

  it("uses web-aligned empty state copy", () => {
    setLocale("en");
    expect(t("home.empty.title")).toBe("Nothing to tend yet");
    expect(t("activity.empty.title")).toBe("No tending logged yet");
  });

  it("formats life area filter toggle labels like web", () => {
    setLocale("en");
    expect(lifeAreaFilterToggleLabel(null)).toBe("Filter by area?");
    expect(lifeAreaFilterToggleLabel("health")).toBe("Filter by area · Health");
  });

  it("uses web-aligned add item copy", () => {
    setLocale("en");
    expect(t("items.add.suggestions.button")).toBe("Need ideas?");
    expect(t("items.add.type.must.hint")).toBe(
      "Use must sparingly for things that truly cannot drift.",
    );
    expect(t("items.add.rhythm.custom")).toBe("Custom interval");
  });

  it("uses web-aligned onboarding copy", () => {
    setLocale("en");
    expect(t("onboarding.welcome.title")).toBe("Welcome to Tend");
    expect(t("onboarding.choose.title")).toBe("What do you want to tend first?");
    expect(t("onboarding.choose.description")).toBe(
      "Write your own, pick a suggestion, or skip and look around first.",
    );
    expect(t("onboarding.preset.title")).toBe("Pick a suggestion");
    expect(t("onboarding.form.save")).toBe("Save and continue");
  });

  it("switches to Serbian copy", () => {
    setLocale("sr");

    expect(getLocale()).toBe("sr");
    expect(t("settings.language.title")).toBe("Jezik");
    expect(lifeAreaFilterToggleLabel("health")).toBe("Filtriranje po oblasti · Zdravlje");

    setLocale("en");
  });
});
