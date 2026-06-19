import { describe, expect, it } from "bun:test";
import { dictionaries, en, sr } from "@/lib/i18n/dictionaries";

describe("web i18n dictionaries", () => {
  it("keeps Serbian keys aligned with English", () => {
    expect(Object.keys(sr).sort()).toEqual(Object.keys(en).sort());
  });

  it("includes Serbian shell and landing copy", () => {
    expect(dictionaries.sr["nav.home"]).toBe("Početna");
    expect(dictionaries.sr["landing.buildCta"]).toBe("Otvori najnoviji Expo build");
  });
});
