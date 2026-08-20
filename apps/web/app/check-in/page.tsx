import { CheckInView } from "@/components/tend/check-in-view";
import { validateSession } from "@/lib/auth/session";
import { loadCheckInSummary } from "@/lib/check-in/load";
import { parseCheckInPeriod } from "@/lib/check-in/validation";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check In · Tend",
};

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  const period = parseCheckInPeriod((await searchParams).period);
  const summary = await loadCheckInSummary(getDb(), user.id, period);

  return <CheckInView user={{ displayName: user.displayName }} period={period} summary={summary} />;
}
