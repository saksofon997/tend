import { InviteOnlyNotice } from "@/components/layout/invite-only-notice";
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
        {inviteOnly ? <InviteOnlyNotice /> : null}
      </div>
      <SiteFooter />
    </div>
  );
}
