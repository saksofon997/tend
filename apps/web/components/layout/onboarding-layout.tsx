import { TendLogoLink } from "@/components/layout/tend-logo-link";
import { TendSceneBackground } from "@/components/layout/tend-scene-background";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen px-4">
      <TendSceneBackground />
      <div className="relative z-10 mx-auto max-w-[30rem] pt-6">
        <TendLogoLink priority />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
