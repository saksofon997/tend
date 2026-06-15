"use client";

import { ItemForm, type ItemFormValues } from "@/components/forms/item-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PresetSuggestions } from "@/components/tend/preset-suggestions";
import { dateInputToIso } from "@/lib/onboarding/constants";
import type { TendPreset } from "@tend/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddItemFormProps {
  user: { displayName: string };
  todayDate: string;
}

const createEmptyDraft = (todayDate: string): Partial<ItemFormValues> => ({
  lastTendedDate: todayDate,
});

export function AddItemForm({ user, todayDate }: AddItemFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<Partial<ItemFormValues>>(() => createEmptyDraft(todayDate));
  const [selectedPresetName, setSelectedPresetName] = useState<string | undefined>();

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

  function applyPreset(preset: TendPreset) {
    setDraft({
      name: preset.name,
      type: preset.type,
      rhythmDays: preset.rhythmDays,
      lifeArea: preset.lifeArea,
      lastTendedDate: todayDate,
    });
    setSelectedPresetName(preset.name);
    setFormKey((key) => key + 1);
    setError(null);

    requestAnimationFrame(() => {
      const nameField = document.getElementById("item-name");
      nameField?.focus();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      nameField?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  return (
    <AppShell user={user} activePath="/">
      <PageHeader title="Add item" subtitle="Capture something you want to maintain." />
      <ItemForm
        key={formKey}
        todayDate={todayDate}
        initial={draft}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/")}
        submitLabel="Save item"
        error={error}
        submitting={submitting}
      />
      <PresetSuggestions
        className="mt-8"
        onSelect={applyPreset}
        selectedPresetName={selectedPresetName}
      />
    </AppShell>
  );
}
