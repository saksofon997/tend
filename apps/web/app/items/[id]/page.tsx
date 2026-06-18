import { ItemDetailView } from "@/components/tend/item-detail-view";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { serializeItem, serializeTendEvent } from "@/lib/items/serialize";
import {
  getItemForUser,
  getRecentEventsForItem,
  getUserSettings,
  isOnboardingComplete,
} from "@tend/db";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Item · Tend",
  };
}

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings(getDb(), user.id);
  if (!isOnboardingComplete(settings)) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const now = new Date();
  const item = await getItemForUser(getDb(), user.id, id);

  if (!item) {
    notFound();
  }

  const recentEvents = await getRecentEventsForItem(getDb(), user.id, id, 10);

  return (
    <ItemDetailView
      user={{ displayName: user.displayName }}
      initialItem={serializeItem(item, now)}
      initialEvents={recentEvents.map(serializeTendEvent)}
    />
  );
}
