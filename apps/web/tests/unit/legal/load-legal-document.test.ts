import { describe, expect, it } from "bun:test";
import { getLegalDisclaimer, loadLegalDocument } from "@/lib/legal/load-legal-document";

describe("legal documents", () => {
  it("loads privacy and terms markdown with required sections", () => {
    const privacy = loadLegalDocument("privacy");
    const terms = loadLegalDocument("terms");

    expect(privacy).toContain("What we store");
    expect(privacy).toContain("hello@tend.qzz.io");
    expect(privacy).toContain("Vercel");
    expect(privacy).toContain("Neon");
    expect(privacy).toContain("do not sell");

    expect(terms).toContain("Terms of Service");
    expect(terms).toContain("hello@tend.qzz.io");
    expect(terms).toContain("Privacy Policy");
  });

  it("includes the alpha sample disclaimer", () => {
    const disclaimer = getLegalDisclaimer();
    expect(disclaimer.toLowerCase()).toContain("sample");
    expect(disclaimer.toLowerCase()).toContain("legal counsel");

    for (const slug of ["privacy", "terms"] as const) {
      expect(loadLegalDocument(slug).toLowerCase()).toContain("not legal advice");
    }
  });
});
