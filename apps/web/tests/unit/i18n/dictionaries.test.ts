import { describe, expect, it } from "bun:test";
import { dictionaries, en, sr } from "@/lib/i18n/dictionaries";

describe("web i18n dictionaries", () => {
  it("keeps Serbian keys aligned with English", () => {
    expect(Object.keys(sr).sort()).toEqual(Object.keys(en).sort());
  });

  it("positions the landing page as a calm companion, not a to-do app", () => {
    expect(dictionaries.en["landing.title"]).toBe("A safe place to tend what keeps you well");
    expect(dictionaries.en["landing.subtitle"]).toContain("without turning them into a to-do list");
    expect(dictionaries.en["landing.point.life.body"]).toContain("Meditation, journaling");
  });

  it("includes Serbian shell and landing copy", () => {
    expect(dictionaries.sr["nav.home"]).toBe("Početna");
    expect(dictionaries.sr["nav.reflections"]).toBe("Osvrti");
    expect(dictionaries.en["reflections.title"]).toBe("Reflections");
    expect(dictionaries.sr["activity.empty.title"]).toBe("Još nema zabeleženih aktivnosti");
    expect(dictionaries.sr["activity.search.title"]).toBe("Pretraži aktivnost");
    expect(dictionaries.sr["activity.search.namePlaceholder"]).toBe("Pretraži tend");
    expect(dictionaries.sr["activity.empty.filtered.title"]).toBe("Ništa ne odgovara toj pretrazi");
    expect(dictionaries.sr["footer.appReleaseSoon"]).toBe("Izdanje aplikacije uskoro...");
    expect(dictionaries.en["landing.checkIn.preview.imageLabel"]).toBe(
      "Preview of the Tend Check In screen",
    );
    expect(dictionaries.sr["landing.checkIn.preview.item"]).toBe("Večernje osmišljavanje");
  });

  it("includes Serbian promo and item action copy", () => {
    expect(dictionaries.sr["promo.remember.title"]).toBe(
      "Stvari koje se zapostave, zapamćene nežno.",
    );
    expect(dictionaries.sr["items.markTended"]).toBe("Označi kao pobrinuto");
    expect(dictionaries.sr["items.lastActivityPrefix"]).toBe("Poslednja aktivnost");
    expect(dictionaries.en["auth.forgotPassword.link"]).toBe("Forgot password?");
    expect(dictionaries.sr["auth.forgotPassword.link"]).toBe("Zaboravljena lozinka?");
    expect(dictionaries.en["email.passwordReset.subject"]).toBe("Reset your Tend password");
    expect(dictionaries.sr["email.passwordReset.action"]).toBe("Izaberi novu lozinku");
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
