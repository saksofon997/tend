import { marketingUrl } from "@/lib/canonical-host";
import { API_VERSION, APP_VERSION } from "@/lib/version";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="tend-content-column flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link
            href={marketingUrl("/privacy")}
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Privacy
          </Link>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <Link
            href={marketingUrl("/terms")}
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Terms
          </Link>
        </nav>
        <span aria-hidden="true" className="hidden text-border sm:inline">
          ·
        </span>
        <span
          className="text-muted-foreground/80"
          title="Serbian and English locale switching ships in a later alpha phase"
        >
          Language: coming soon
        </span>
        <span aria-hidden="true" className="hidden text-border sm:inline">
          ·
        </span>
        <span
          className="text-xs text-muted-foreground/70"
          aria-label={`App version ${APP_VERSION}, API version ${API_VERSION}`}
        >
          App {APP_VERSION} · API {API_VERSION}
        </span>
      </div>
    </footer>
  );
}
