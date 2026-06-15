"use client";

import { ItemForm, type ItemFormValues } from "@/components/forms/item-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { dateInputToIso } from "@/lib/onboarding/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddItemFormProps {
  user: { displayName: string };
  todayDate: string;
}

export function AddItemForm({ user, todayDate }: AddItemFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: ItemFormValues) {
    if (!values.name.trim()) {
      setError("Give your item a name");
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/v1/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        type: values.type,
        rhythmDays: values.rhythmDays,
        lifeArea: values.lifeArea,
        lastTendedAt: dateInputToIso(values.lastTendedDate),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Unable to create item");
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AppShell user={user} activePath="/">
      <PageHeader title="Add item" subtitle="Capture something you want to maintain." />
      <ItemForm
        todayDate={todayDate}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/")}
        submitLabel="Save item"
        error={error}
        submitting={submitting}
      />
    </AppShell>
  );
}
