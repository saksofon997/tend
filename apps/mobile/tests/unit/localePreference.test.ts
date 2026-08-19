import { describe, expect, it } from "bun:test";
import { getLocale, t } from "../../src/i18n";
import { applyLocale, localeFromStorage } from "../../src/utils/localePreference";

describe("localeFromStorage", () => {
  it("accepts English and Serbian values", () => {
    expect(localeFromStorage("en")).toBe("en");
    expect(localeFromStorage("sr")).toBe("sr");
  });

  it("ignores missing or unknown values", () => {
    expect(localeFromStorage(null)).toBeNull();
    expect(localeFromStorage(undefined)).toBeNull();
    expect(localeFromStorage("de")).toBeNull();
    expect(localeFromStorage("")).toBeNull();
  });
});

describe("applyLocale", () => {
  it("switches copy used on the start screen before sign-in", () => {
    applyLocale("sr");

    expect(getLocale()).toBe("sr");
    expect(t("language.label")).toBe("Jezik");
    expect(t("auth.signIn.button")).toBe("Prijavi se");
    expect(t("onboarding.welcome.title")).toBe("Dobro došli u Tend");

    applyLocale("en");
    expect(t("language.label")).toBe("Language");
    expect(t("onboarding.welcome.title")).toBe("Welcome to Tend");
  });
});
