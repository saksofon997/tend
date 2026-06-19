"use client";

import { LanguageSelect } from "@/components/layout/language-select";
import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { LandingPromoPreview } from "@/components/marketing/landing-promo-preview";
import { Button } from "@/components/ui/button";
import { appUrl } from "@/lib/canonical-host";
import { useI18n } from "@/lib/i18n/client";
import Link from "next/link";

const VALUE_POINTS = [
  {
    titleKey: "landing.point.awareness.title",
    bodyKey: "landing.point.awareness.body",
  },
  {
    titleKey: "landing.point.life.title",
    bodyKey: "landing.point.life.body",
  },
  {
    titleKey: "landing.point.scan.title",
    bodyKey: "landing.point.scan.body",
  },
] as const;

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="tend-marketing-column flex items-center justify-between py-6">
        <TendLogoLink imageClassName="h-8 w-auto" priority />
        <div className="flex items-center gap-2">
          <LanguageSelect id="landing-language" />
          <Button variant="ghost" size="sm" asChild>
            <Link href={appUrl("/login")}>{t("landing.signIn")}</Link>
          </Button>
        </div>
      </header>

      <main className="tend-marketing-column flex flex-1 flex-col pb-12 pt-4 lg:pt-10">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">{t("landing.eyebrow")}</p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-balance text-foreground sm:text-4xl">
              {t("landing.title")}
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground text-pretty">
              {t("landing.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href={appUrl("/register")}>{t("landing.createAccount")}</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href={appUrl("/login")}>{t("landing.signIn")}</Link>
              </Button>
            </div>
          </div>

          <div className="w-full min-w-0">
            <LandingPromoPreview />
          </div>
        </section>

        <section aria-label={t("landing.howItWorks")} className="mt-14 grid gap-6 sm:grid-cols-3">
          {VALUE_POINTS.map((point) => (
            <article key={point.titleKey}>
              <h2 className="font-display text-lg font-medium text-foreground">
                {t(point.titleKey)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(point.bodyKey)}
              </p>
            </article>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
