"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";

export function SignOutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSignOut() {
    setSubmitting(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleSignOut} disabled={submitting}>
      {submitting ? "Signing out…" : "Sign out"}
    </Button>
  );
}
