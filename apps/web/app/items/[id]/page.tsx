import { ItemDetailView } from "@/components/tend/item-detail-view";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { serializeItem, serializeTendEvent } from "@/lib/items/serialize";
import { getSharedUserMapForItems, sharedUserForItem } from "@/lib/items/sharing";
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

  const database = getDb();
  const settings = await getUserSettings(database, user.id);
  if (!isOnboardingComplete(settings)) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const now = new Date();
  const item = await getItemForUser(database, user.id, id);

  if (!item) {
    notFound();
  }

  const [recentEvents, sharedUserMap] = await Promise.all([
    getRecentEventsForItem(database, user.id, id, 10),
    getSharedUserMapForItems(database, user.id, [item]),
  ]);

  return (
    <ItemDetailView
      user={{ displayName: user.displayName }}
      initialItem={serializeItem(
        item,
        now,
        sharedUserForItem(item, user.id, sharedUserMap),
        user.id,
      )}
      initialEvents={recentEvents.map(serializeTendEvent)}
    />
  );
}
