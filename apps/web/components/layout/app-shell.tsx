import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  user?: { displayName: string };
  activePath?: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/activity", label: "Activity" },
  { href: "/settings/availability", label: "Availability" },
] as const;

export function AppShell({ children, user, activePath }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="tend-content-column flex h-14 items-center gap-4">
          <Link href="/" className="shrink-0 font-display text-lg font-medium text-primary">
            Tend
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-4">
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
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {user ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.displayName}
              </span>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="tend-content-column py-6">{children}</main>
    </div>
  );
}
