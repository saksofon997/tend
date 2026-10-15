import { AppShell } from "@/components/layout/app-shell";
import { SettingsPageHeader } from "@/components/layout/settings-page-header";
import { ResetTendSection } from "@/components/tend/reset-tend-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateSession } from "@/lib/auth/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings · Tend",
};

export default async function SettingsPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={{ displayName: user.displayName }} activePath="/settings">
      <SettingsPageHeader />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{user.displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </CardContent>
        </Card>
        <ResetTendSection />
      </div>
    </AppShell>
  );
}
