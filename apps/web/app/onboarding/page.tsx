import { OnboardingFlow } from "@/components/onboarding-flow";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayDateInputValue } from "@/lib/onboarding/constants";
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

  const todayDate = todayDateInputValue(new Date());

  return <OnboardingFlow todayDate={todayDate} />;
}
