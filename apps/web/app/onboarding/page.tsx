import { OnboardingFlow } from "@/components/onboarding-flow";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getUserSettings, isOnboardingComplete } from "@tend/db";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings(getDb(), user.id);
  if (isOnboardingComplete(settings)) {
    redirect("/");
  }

  return <OnboardingFlow />;
}
