import { LandingPage } from "@/components/marketing/landing-page";
import { HomeView } from "@/components/tend/home-view";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { serializeItem } from "@/lib/items/serialize";
import { getUserSettings, isOnboardingComplete, listItemsForUser } from "@tend/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home · Tend",
};

export default async function HomePage() {
  const { user } = await validateSession();

  if (!user) {
    return <LandingPage />;
  }

  const settings = await getUserSettings(getDb(), user.id);
  if (!isOnboardingComplete(settings)) {
    redirect("/onboarding");
  }

  const now = new Date();
  const items = await listItemsForUser(getDb(), user.id, {});

  return (
    <HomeView
      user={{ displayName: user.displayName }}
      initialItems={items.map((item) => serializeItem(item, now))}
    />
  );
}
