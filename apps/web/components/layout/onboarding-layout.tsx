import { TendLogoLink } from "@/components/layout/tend-logo-link";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background px-4">
      <div className="mx-auto max-w-[30rem] pt-6">
        <TendLogoLink priority />
      </div>
      {children}
    </div>
  );
}
