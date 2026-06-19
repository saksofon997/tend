"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { UserMenu } from "@/components/layout/user-menu";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  user?: { displayName: string };
  activePath?: string;
}

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/activity", labelKey: "nav.activity" },
  { href: "/settings/availability", labelKey: "nav.availability" },
] as const;

export function AppShell({ children, user, activePath }: AppShellProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="tend-content-column flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 py-2 sm:flex-nowrap sm:gap-4">
          <TendLogoLink />

          <nav className="order-3 flex w-full flex-1 items-center justify-center gap-3 sm:order-none sm:w-auto sm:gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors duration-[var(--tend-duration-fast)]",
                  activePath === item.href
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <label className="sr-only" htmlFor="app-language">
                  {t("language.label")}
                </label>
                <Select
                  id="app-language"
                  aria-label={t("language.label")}
                  className="h-9 w-[6.75rem] py-1 pr-7 pl-2 text-sm sm:w-[7.5rem]"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value === "sr" ? "sr" : "en")}
                >
                  <option value="en">{t("language.english")}</option>
                  <option value="sr">{t("language.serbian")}</option>
                </Select>
                <UserMenu />
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="tend-content-column flex-1 py-6">{children}</main>

      <SiteFooter />
    </div>
  );
}
