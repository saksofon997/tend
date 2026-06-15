import { readFileSync } from "node:fs";
import { join } from "node:path";

export type LegalDocumentSlug = "privacy" | "terms";

const LEGAL_DIR = join(process.cwd(), "content/legal");

export function loadLegalDocument(slug: LegalDocumentSlug): string {
  return readFileSync(join(LEGAL_DIR, `${slug}.md`), "utf-8");
}

export function getLegalDisclaimer(): string {
  return "Sample document for alpha testing. Not reviewed by legal counsel.";
}
