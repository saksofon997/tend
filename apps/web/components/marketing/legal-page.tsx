import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { TendSceneBackground } from "@/components/layout/tend-scene-background";
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
    <div className="relative flex min-h-screen flex-col">
      <TendSceneBackground />
      <header className="tend-content-column relative z-10 py-6">
        <TendLogoLink imageClassName="h-8 w-auto" />
      </header>

      <main className="tend-content-column relative z-10 flex-1 pb-12">
        <Alert variant="info" className="mb-8">
          <AlertDescription>{disclaimer}</AlertDescription>
        </Alert>
        <MarkdownContent source={content} />
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
