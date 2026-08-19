import { describe, expect, it } from "bun:test";
import { dictionaries, en, sr } from "@/lib/i18n/dictionaries";

describe("web i18n dictionaries", () => {
  it("keeps Serbian keys aligned with English", () => {
    expect(Object.keys(sr).sort()).toEqual(Object.keys(en).sort());
  });

  it("includes Serbian shell and landing copy", () => {
    expect(dictionaries.sr["nav.home"]).toBe("Početna");
    expect(dictionaries.sr["activity.empty.title"]).toBe("Još nema zabeleženih aktivnosti");
    expect(dictionaries.en["activity.search.title"]).toBe("Look up activity");
    expect(dictionaries.sr["activity.empty.filtered.title"]).toBe("Ništa ne odgovara toj pretrazi");
    expect(dictionaries.sr["footer.appReleaseSoon"]).toBe("Izdanje aplikacije uskoro...");
    expect(dictionaries.en["landing.checkIn.preview.imageLabel"]).toBe(
      "Preview of the Tend Check In screen",
    );
    expect(dictionaries.sr["landing.checkIn.preview.item"]).toBe("Zalivanje sobnih biljaka");
  });

  it("includes Serbian promo and item action copy", () => {
    expect(dictionaries.sr["promo.remember.title"]).toBe(
      "Stvari koje se zapostave, zapamćene nežno.",
    );
    expect(dictionaries.sr["items.markTended"]).toBe("Označi kao pobrinuto");
    expect(dictionaries.sr["items.lastActivityPrefix"]).toBe("Poslednja aktivnost");
  });

  it("translates status labels", () => {
    expect(dictionaries.en["status.fresh"]).toBe("Fresh");
    expect(dictionaries.en["status.gettingStale"]).toBe("Getting stale");
    expect(dictionaries.en["status.needsAttention"]).toBe("Needs attention");
    expect(dictionaries.sr["status.fresh"]).toBe("Sveže");
    expect(dictionaries.sr["status.gettingStale"]).toBe("Zapostavljeno");
    expect(dictionaries.sr["status.needsAttention"]).toBe("Traži pažnju");
  });
});
