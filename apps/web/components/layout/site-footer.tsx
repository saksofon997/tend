"use client";

import { marketingUrl } from "@/lib/canonical-host";
import { useI18n } from "@/lib/i18n/client";
import { API_VERSION, APP_VERSION } from "@/lib/version";
import Link from "next/link";

const LATEST_EXPO_BUILD_URL = "https://expo.dev/accounts/saksofon997/projects/tend/builds";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="tend-content-column flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link
            href={marketingUrl("/privacy")}
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("footer.privacy")}
          </Link>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <Link
            href={marketingUrl("/terms")}
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("footer.terms")}
          </Link>
        </nav>
        <span
          className="text-xs text-muted-foreground/70"
          aria-label={`App version ${APP_VERSION}, API version ${API_VERSION}`}
        >
          {t("footer.appVersion", { appVersion: APP_VERSION, apiVersion: API_VERSION })}
          <span aria-hidden="true"> · </span>
          <a
            href={LATEST_EXPO_BUILD_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("footer.appReleaseSoon")}
          </a>
        </span>
      </div>
    </footer>
  );
}
