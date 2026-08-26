"use client";

import { LanguageSelect } from "@/components/layout/language-select";
import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { TendSceneBackground } from "@/components/layout/tend-scene-background";
import { LandingPromoPreview } from "@/components/marketing/landing-promo-preview";
import { Button } from "@/components/ui/button";
import { appUrl } from "@/lib/canonical-host";
import { useI18n } from "@/lib/i18n/client";
import { WEEKDAY_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { CalendarDays, HeartHandshake, Leaf, ListChecks, Sprout, SunMedium } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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

const FEATURE_POINTS = [
  {
    titleKey: "landing.feature.friend.title",
    bodyKey: "landing.feature.friend.body",
  },
  {
    titleKey: "landing.feature.rhythm.title",
    bodyKey: "landing.feature.rhythm.body",
  },
  {
    titleKey: "landing.feature.tended.title",
    bodyKey: "landing.feature.tended.body",
  },
] as const;

const CHECK_IN_POINTS = [
  {
    titleKey: "landing.checkIn.point.item.title",
    bodyKey: "landing.checkIn.point.item.body",
  },
  {
    titleKey: "landing.checkIn.point.people.title",
    bodyKey: "landing.checkIn.point.people.body",
  },
  {
    titleKey: "landing.checkIn.point.days.title",
    bodyKey: "landing.checkIn.point.days.body",
  },
] as const;

const CHECK_IN_WEEKDAY_COUNTS = [
  { weekday: 1, count: 1 },
  { weekday: 2, count: 0 },
  { weekday: 3, count: 3 },
  { weekday: 4, count: 4 },
  { weekday: 5, count: 2 },
  { weekday: 6, count: 1 },
  { weekday: 0, count: 1 },
] as const;

export const LANDING_SECTION_CLASS = "mt-16 border-t border-border pt-10";
export const LANDING_SECTION_INTRO_CLASS = "mx-auto max-w-2xl text-center";
export const LANDING_POINT_GRID_CLASS = "mt-8 grid gap-6 sm:grid-cols-3";

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col">
      <TendSceneBackground />
      <header className="tend-marketing-column relative z-10 flex items-center justify-between py-6">
        <TendLogoLink imageClassName="h-8 w-auto" priority />
        <div className="flex items-center gap-2">
          <LanguageSelect id="landing-language" />
          <Button variant="ghost" size="sm" asChild>
            <Link href={appUrl("/login")}>{t("landing.signIn")}</Link>
          </Button>
        </div>
      </header>

      <main className="tend-marketing-column relative z-10 flex flex-1 flex-col pb-12 pt-4 lg:pt-10">
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

        <section aria-labelledby="landing-how-it-works-title" className={LANDING_SECTION_CLASS}>
          <LandingSectionIntro id="landing-how-it-works-title" title={t("landing.howItWorks")} />
          <div className={LANDING_POINT_GRID_CLASS}>
            {VALUE_POINTS.map((point) => (
              <LandingPoint
                key={point.titleKey}
                title={t(point.titleKey)}
                body={t(point.bodyKey)}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="landing-features-title" className={LANDING_SECTION_CLASS}>
          <LandingSectionIntro
            id="landing-features-title"
            title={t("landing.features.title")}
            subtitle={t("landing.features.subtitle")}
          />
          <div className="mx-auto mt-8 w-full max-w-[26rem] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Image
              src="/promo/tend-friend.png"
              alt={t("landing.features.imageAlt")}
              width={1448}
              height={1086}
              sizes="(max-width: 640px) 100vw, 26rem"
              className="h-full w-full object-cover"
            />
          </div>
          <div className={LANDING_POINT_GRID_CLASS}>
            {FEATURE_POINTS.map((point) => (
              <LandingPoint
                key={point.titleKey}
                title={t(point.titleKey)}
                body={t(point.bodyKey)}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="landing-check-in-title" className={LANDING_SECTION_CLASS}>
          <LandingSectionIntro
            id="landing-check-in-title"
            title={t("landing.checkIn.title")}
            subtitle={t("landing.checkIn.subtitle")}
          />

          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:items-center">
            <LandingCheckInScreenshot />

            <div className="grid gap-4">
              {CHECK_IN_POINTS.map((point) => (
                <article key={point.titleKey} className="border-border border-b pb-4 last:border-0">
                  <LandingPointCopy title={t(point.titleKey)} body={t(point.bodyKey)} />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

function LandingSectionIntro({
  id,
  subtitle,
  title,
}: {
  id: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className={LANDING_SECTION_INTRO_CLASS}>
      <h2 id={id} className="font-display text-2xl font-medium text-foreground text-balance">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
      ) : null}
    </div>
  );
}

function LandingPointCopy({ body, title }: { body: string; title: string }) {
  return (
    <>
      <h3 className="font-display text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{body}</p>
    </>
  );
}

function LandingPoint({ body, title }: { body: string; title: string }) {
  return (
    <article className="min-w-0">
      <LandingPointCopy body={body} title={title} />
    </article>
  );
}

function LandingCheckInScreenshot() {
  const { t } = useI18n();

  return (
    <div
      role="img"
      aria-label={t("landing.checkIn.preview.imageLabel")}
      className="tend-thought-card overflow-hidden border border-border bg-card shadow-sm"
    >
      <div aria-hidden="true">
        <div className="flex items-center justify-between border-border border-b bg-card px-4 py-3">
          <div className="font-display font-medium text-foreground text-lg">Tend</div>
          <div className="hidden items-center gap-4 text-muted-foreground text-xs sm:flex">
            <span>{t("nav.home")}</span>
            <span className="rounded-full bg-[var(--tend-primary-muted)] px-3 py-1 font-medium text-primary">
              {t("nav.checkIn")}
            </span>
            <span>{t("nav.reflections")}</span>
          </div>
          <div className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
            {t("landing.checkIn.preview.user")}
          </div>
        </div>

        <div className="bg-background/70 p-4 sm:p-5">
          <div>
            <p className="font-display font-medium text-2xl text-foreground">
              {t("checkIn.title")}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">{t("checkIn.subtitle")}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--tend-primary-muted)] px-3 py-1 font-medium text-primary text-xs">
              {t("checkIn.period.week")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
              {t("checkIn.period.month")}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
              {t("checkIn.period.all")}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <CheckInPreviewStat
              icon={<Sprout className="size-4" />}
              label={t("checkIn.stat.tendingLogged.label")}
              value="12"
              helper={t("checkIn.stat.tendingLogged.helper", { count: 5 })}
            />
            <CheckInPreviewStat
              icon={<SunMedium className="size-4" />}
              label={t("checkIn.stat.careDays.label")}
              value="6"
              helper={t("checkIn.stat.careDays.helper")}
            />
            <CheckInPreviewStat
              icon={<HeartHandshake className="size-4" />}
              label={t("checkIn.stat.shared.label")}
              value="3"
              helper={t("checkIn.stat.shared.helper", {
                name: t("landing.checkIn.preview.shared"),
              })}
            />
          </div>

          <div className="mt-3 tend-thought-card border border-border bg-card p-4">
            <p className="font-medium text-foreground text-sm">{t("checkIn.patterns.title")}</p>
            <div className="mt-3 grid gap-2">
              <CheckInPreviewPattern
                icon={<ListChecks className="size-4" />}
                label={t("checkIn.pattern.mostTended.label")}
                value={t("landing.checkIn.preview.item")}
                detail={t("checkIn.tendedMoments", { count: 4 })}
              />
              <CheckInPreviewPattern
                icon={<HeartHandshake className="size-4" />}
                label={t("checkIn.pattern.with.label")}
                value={t("landing.checkIn.preview.shared")}
                detail={t("checkIn.sharedTendedMoments", { count: 3 })}
              />
              <CheckInPreviewPattern
                icon={<Leaf className="size-4" />}
                label={t("checkIn.pattern.area.label")}
                value={t("landing.checkIn.preview.area")}
                detail={t("checkIn.tendedMoments", { count: 5 })}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.72fr]">
            <div className="tend-thought-card border border-border bg-card p-4">
              <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                <CalendarDays className="size-4 text-primary" />
                {t("checkIn.weekday.title")}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {CHECK_IN_WEEKDAY_COUNTS.map((entry) => {
                  const active = entry.count > 0;
                  return (
                    <div key={entry.weekday} className="min-w-0 text-center">
                      <div
                        className={
                          active
                            ? "flex min-h-9 items-center justify-center rounded-md border border-[var(--tend-status-fresh)] bg-[var(--tend-status-fresh-bg)] font-medium text-[var(--tend-status-fresh)] text-xs"
                            : "flex min-h-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground text-xs"
                        }
                      >
                        {entry.count}
                      </div>
                      <div className="mt-1 truncate text-muted-foreground text-xs">
                        {weekdayShortLabel(t(WEEKDAY_TRANSLATION_KEYS[entry.weekday]))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tend-thought-card border border-border bg-card p-4">
              <p className="font-medium text-foreground text-sm">{t("checkIn.rightNow.title")}</p>
              <div className="mt-3 grid gap-2">
                <CheckInPreviewCount label={t("sections.needsAttention")} value="2" />
                <CheckInPreviewCount label={t("sections.gettingStale")} value="4" />
                <CheckInPreviewCount label={t("status.fresh")} value="7" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckInPreviewStat({
  helper,
  icon,
  label,
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="tend-thought-card border border-border bg-card p-4">
      <div className="flex items-center gap-2 font-medium text-primary text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 font-display text-3xl text-foreground">{value}</div>
      <p className="mt-1 text-muted-foreground text-xs">{helper}</p>
    </div>
  );
}

function CheckInPreviewPattern({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="tend-thought-inset flex gap-3 border border-border bg-background/60 p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="mt-1 truncate font-medium text-foreground text-sm">{value}</div>
        <div className="mt-1 text-muted-foreground text-xs">{detail}</div>
      </div>
    </div>
  );
}

function CheckInPreviewCount({ label, value }: { label: string; value: string }) {
  return (
    <div className="tend-thought-inset flex items-center justify-between border border-border bg-muted/40 px-3 py-2">
      <span className="truncate text-muted-foreground text-xs">{label}</span>
      <span className="font-display text-foreground text-lg">{value}</span>
    </div>
  );
}

function weekdayShortLabel(label: string) {
  return label.slice(0, 3);
}
