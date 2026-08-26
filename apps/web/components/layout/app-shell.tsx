"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { TendSceneBackground } from "@/components/layout/tend-scene-background";
import { UserMenu } from "@/components/layout/user-menu";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  user?: { displayName: string };
  activePath?: string;
}

export const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/check-in", labelKey: "nav.checkIn" },
  { href: "/reflections", labelKey: "nav.reflections" },
  { href: "/activity", labelKey: "nav.activity", hideOnMobile: true },
  { href: "/settings/availability", labelKey: "nav.availability" },
] as const;

export const APP_SHELL_HEADER_ROW_CLASS =
  "tend-content-column flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 py-2 md:flex-nowrap md:gap-4";

export const APP_SHELL_NAV_CLASS =
  "order-3 flex w-full flex-1 items-center justify-center gap-3 md:order-none md:w-auto md:gap-4";

export const APP_SHELL_USER_MENU_SLOT_CLASS = "ml-auto flex shrink-0 items-center gap-2";

export function AppShell({ children, user, activePath }: AppShellProps) {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col">
      <TendSceneBackground />
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-[3px]">
        <div className={APP_SHELL_HEADER_ROW_CLASS}>
          <TendLogoLink />

          <nav className={APP_SHELL_NAV_CLASS}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors duration-[var(--tend-duration-fast)]",
                  "hideOnMobile" in item && item.hideOnMobile ? "hidden md:inline" : null,
                  activePath === item.href
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className={APP_SHELL_USER_MENU_SLOT_CLASS}>{user ? <UserMenu /> : null}</div>
        </div>
      </header>

      <main className="tend-content-column relative z-10 flex-1 py-6">{children}</main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
