import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  type LegalDocumentSlug,
  getLegalDisclaimer,
  loadLegalDocument,
} from "@/lib/legal/load-legal-document";
import { MarkdownContent } from "@/lib/legal/markdown-content";

interface LegalPageProps {
  slug: LegalDocumentSlug;
}

export function LegalPage({ slug }: LegalPageProps) {
  const content = loadLegalDocument(slug);
  const disclaimer = getLegalDisclaimer();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="tend-content-column py-6">
        <TendLogoLink imageClassName="h-8 w-auto" />
      </header>

      <main className="tend-content-column flex-1 pb-12">
        <Alert variant="info" className="mb-8">
          <AlertDescription>{disclaimer}</AlertDescription>
        </Alert>
        <MarkdownContent source={content} />
      </main>

      <SiteFooter />
    </div>
  );
}
