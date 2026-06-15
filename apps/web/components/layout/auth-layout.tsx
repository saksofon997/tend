import { SiteFooter } from "@/components/layout/site-footer";
import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { isRegistrationRestricted } from "@/lib/auth/allowed-emails";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const inviteOnly = isRegistrationRestricted();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <TendLogoLink className="mb-8" imageClassName="h-9 w-auto" priority />
        {children}
        {inviteOnly ? (
          <p className="mt-6 max-w-md text-center text-xs text-muted-foreground/80">
            Private pre-alpha. Access is invite-only.
          </p>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}
