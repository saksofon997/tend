import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { LandingPromoPreview } from "@/components/marketing/landing-promo-preview";
import { Button } from "@/components/ui/button";
import { appUrl } from "@/lib/canonical-host";
import Link from "next/link";

const VALUE_POINTS = [
  {
    title: "Awareness, not pressure",
    body: "Tend surfaces what could use attention with calm language. No red overdue badges, streaks, or guilt loops.",
  },
  {
    title: "Built for real life",
    body: "Track household care, health upkeep, relationships, pets, vehicles, and life admin in one quiet place.",
  },
  {
    title: "Fast to scan",
    body: "Open once or twice a week, see what drifted, mark something tended, and move on. Under a minute to add an item.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="tend-marketing-column flex items-center justify-between py-6">
        <TendLogoLink imageClassName="h-8 w-auto" priority />
        <Button variant="ghost" size="sm" asChild>
          <Link href={appUrl("/login")}>Sign in</Link>
        </Button>
      </header>

      <main className="tend-marketing-column flex flex-1 flex-col pb-12 pt-4 lg:pt-10">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">Life maintenance, remembered softly</p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-balance text-foreground sm:text-4xl">
              The recurring parts of life, without the productivity theater
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground text-pretty">
              Tend helps you notice what could use a little care: bed sheets, check-ins, bills, vet
              visits, oil changes. Gentle reminders and honest status, not overdue punishment.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href={appUrl("/register")}>Create an account</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href={appUrl("/login")}>Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="w-full min-w-0">
            <LandingPromoPreview />
          </div>
        </section>

        <section aria-label="How Tend works" className="mt-14 grid gap-6 sm:grid-cols-3">
          {VALUE_POINTS.map((point) => (
            <article key={point.title}>
              <h2 className="font-display text-lg font-medium text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
            </article>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
