"use client";

import { ItemForm, type ItemFormValues } from "@/components/forms/item-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PresetSuggestions } from "@/components/tend/preset-suggestions";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { dateInputToIso, todayDateInputValue } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";
import type { TendPreset } from "@tend/domain";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

interface AddItemFormProps {
  user: { displayName: string };
}

const createEmptyDraft = (todayDate: string): Partial<ItemFormValues> => ({
  lastTendedDate: todayDate,
});

export function AddItemForm({ user }: AddItemFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const todayDate = todayDateInputValue();
  const suggestionsId = useId();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<Partial<ItemFormValues>>(() => createEmptyDraft(todayDate));
  const [selectedPresetName, setSelectedPresetName] = useState<string | undefined>();

  async function handleSubmit(values: ItemFormValues) {
    if (!values.name.trim()) {
      setError(t("errors.item.nameRequired"));
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
      setError(body.error ?? t("errors.item.create"));
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
      <PageHeader
        title={t("items.add.title")}
        subtitle={t("items.add.subtitle")}
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-[var(--tend-text-muted)] hover:text-foreground"
            aria-expanded={showSuggestions}
            aria-controls={suggestionsId}
            onClick={() => setShowSuggestions((open) => !open)}
          >
            {t("items.add.suggestions.button")}
          </Button>
        }
      />
      <div
        aria-hidden={!showSuggestions}
        data-open={showSuggestions}
        className={cn("tend-collapsible-reveal", !showSuggestions && "pointer-events-none")}
      >
        <div className="tend-collapsible-reveal__inner">
          <div className="tend-collapsible-reveal__content">
            <PresetSuggestions
              id={suggestionsId}
              onSelect={applyPreset}
              selectedPresetName={selectedPresetName}
            />
          </div>
        </div>
      </div>
      <ItemForm
        key={formKey}
        initial={draft}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/")}
        submitLabel={t("items.add.save")}
        error={error}
        submitting={submitting}
      />
    </AppShell>
  );
}
