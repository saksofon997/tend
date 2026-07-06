import { CheckInView } from "@/components/tend/check-in-view";
import { serializeActivityEntry } from "@/lib/activity/serialize";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { serializeItem } from "@/lib/items/serialize";
import { getSharedUserMapForItems, sharedUserForItem } from "@/lib/items/sharing";
import { listItemsForUser, listRecentEventsForUser } from "@tend/db";
import { buildCheckInSummary } from "@tend/domain";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check In · Tend",
};

export default async function CheckInPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const database = getDb();
  const now = new Date();
  const [items, recentEventRows] = await Promise.all([
    listItemsForUser(database, user.id, {}),
    listRecentEventsForUser(database, user.id, 100),
  ]);
  const sharedUserMap = await getSharedUserMapForItems(database, user.id, items);
  const serializedItems = items.map((item) =>
    serializeItem(item, now, sharedUserForItem(item, user.id, sharedUserMap), user.id),
  );
  const summary = buildCheckInSummary(serializedItems, recentEventRows.map(serializeActivityEntry));

  return <CheckInView user={{ displayName: user.displayName }} summary={summary} />;
}
