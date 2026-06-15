import { isRegistrationRestricted } from "@/lib/auth/allowed-emails";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const inviteOnly = isRegistrationRestricted();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-8 font-display text-2xl font-medium text-primary">
        Tend
      </Link>
      {children}
      {inviteOnly ? (
        <p className="mt-6 max-w-md text-center text-xs text-muted-foreground/80">
          Private pre-alpha. Access is invite-only.
        </p>
      ) : null}
    </div>
  );
}
