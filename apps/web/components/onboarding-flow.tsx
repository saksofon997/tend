"use client";

import { ItemForm, type ItemFormValues } from "@/components/forms/item-form";
import { OnboardingStep } from "@/components/layout/onboarding-step";
import { PromoCarousel } from "@/components/onboarding/promo-carousel";
import { PresetCard } from "@/components/tend/preset-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LIFE_AREA_LABELS, LIFE_AREA_ORDER, dateInputToIso } from "@/lib/onboarding/constants";
import { ONBOARDING_PROMO_SLIDES } from "@/lib/onboarding/promo-slides";
import { cn } from "@/lib/utils";
import { PRESETS_BY_AREA } from "@tend/domain";
import type { LifeArea, TendItemType, TendPreset } from "@tend/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "welcome" | "choose" | "custom" | "preset" | "preset-edit";

interface ItemDraft {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
}

const createDefaultDraft = (todayDate: string): ItemDraft => ({
  name: "",
  type: "want",
  rhythmDays: 7,
  lifeArea: null,
  lastTendedDate: todayDate,
});

const STEP_MAP: Record<Step, number> = {
  welcome: 1,
  choose: 2,
  custom: 3,
  preset: 3,
  "preset-edit": 4,
};

export function OnboardingFlow({ todayDate }: { todayDate: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Exclude<LifeArea, "personal">>("household");
  const [draft, setDraft] = useState<ItemDraft>(() => createDefaultDraft(todayDate));

  async function finishOnboarding() {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/v1/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Unable to finish setup");
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function saveFirstItem(values: ItemFormValues) {
    if (!values.name.trim()) {
      setError("Give your item a name");
      return;
    }

    setSubmitting(true);
    setError(null);

    const createResponse = await fetch("/api/v1/items", {
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

    if (!createResponse.ok) {
      const body = (await createResponse.json()) as { error?: string };
      setError(body.error ?? "Unable to create item");
      setSubmitting(false);
      return;
    }

    await finishOnboarding();
  }

  function openPreset(preset: TendPreset) {
    setDraft({
      name: preset.name,
      type: preset.type,
      rhythmDays: preset.rhythmDays,
      lifeArea: preset.lifeArea,
      lastTendedDate: todayDate,
    });
    setStep("preset-edit");
  }

  if (step === "welcome") {
    const promoSlide = ONBOARDING_PROMO_SLIDES[carouselIndex];

    return (
      <div className="min-h-screen bg-background px-4">
        <div className="mx-auto max-w-[30rem] pt-10">
          <Link href="/" className="font-display text-lg font-medium text-primary">
            Tend
          </Link>
        </div>
        <OnboardingStep
          step={STEP_MAP[step]}
          totalSteps={4}
          title={carouselIndex === 0 ? "Welcome to Tend" : promoSlide.title}
          description={promoSlide.description}
          footer={
            <>
              <Button type="button" onClick={() => setStep("choose")}>
                Add your first item
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={finishOnboarding}
                disabled={submitting}
              >
                {submitting ? "Skipping…" : "Skip to the app"}
              </Button>
            </>
          }
        >
          <PromoCarousel
            slides={ONBOARDING_PROMO_SLIDES}
            activeIndex={carouselIndex}
            onActiveIndexChange={setCarouselIndex}
          />
          {error ? (
            <Alert variant="error" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </OnboardingStep>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="min-h-screen bg-background px-4">
        <OnboardingStep
          step={STEP_MAP[step]}
          totalSteps={4}
          title="What do you want to tend first?"
          description="Write your own, pick a suggestion, or skip and look around first."
          footer={
            <>
              <Button
                type="button"
                onClick={() => {
                  setDraft(createDefaultDraft(todayDate));
                  setStep("custom");
                }}
              >
                Add my own
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep("preset")}>
                Browse suggestions
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={finishOnboarding}
                disabled={submitting}
              >
                {submitting ? "Skipping…" : "Skip for now"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("welcome")}>
                Back
              </Button>
            </>
          }
        >
          {error ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </OnboardingStep>
      </div>
    );
  }

  if (step === "custom") {
    return (
      <div className="min-h-screen bg-background px-4">
        <OnboardingStep
          step={STEP_MAP[step]}
          totalSteps={4}
          title="Add your first item"
          description="You can change type, rhythm, and last tended date before saving."
        >
          <ItemForm
            todayDate={todayDate}
            initial={draft}
            onSubmit={saveFirstItem}
            onCancel={() => setStep("choose")}
            submitLabel="Save and continue"
            error={error}
            submitting={submitting}
          />
        </OnboardingStep>
      </div>
    );
  }

  if (step === "preset") {
    const presets = PRESETS_BY_AREA[selectedArea];

    return (
      <div className="min-h-screen bg-background px-4">
        <OnboardingStep
          step={STEP_MAP[step]}
          totalSteps={4}
          title="Pick a suggestion"
          description="Choose a life area, then tap something that fits your life."
          footer={
            <Button type="button" variant="ghost" onClick={() => setStep("choose")}>
              Back
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Life areas">
            {LIFE_AREA_ORDER.map((area) => (
              <button
                key={area}
                type="button"
                role="tab"
                aria-selected={selectedArea === area}
                onClick={() => setSelectedArea(area)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedArea === area
                    ? "bg-[var(--tend-primary-muted)] text-primary"
                    : "bg-[var(--tend-bg-muted)] text-muted-foreground hover:bg-[var(--tend-bg-subtle)]",
                )}
              >
                {LIFE_AREA_LABELS[area]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {presets.map((preset) => (
              <PresetCard
                key={preset.name}
                name={preset.name}
                type={preset.type}
                rhythmDays={preset.rhythmDays}
                onSelect={() => openPreset(preset)}
              />
            ))}
          </div>
        </OnboardingStep>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4">
      <OnboardingStep
        step={STEP_MAP[step]}
        totalSteps={4}
        title="Customize your item"
        description="Adjust type, rhythm, or last tended before saving."
      >
        <ItemForm
          todayDate={todayDate}
          initial={draft}
          onSubmit={saveFirstItem}
          onCancel={() => setStep("preset")}
          submitLabel="Save and continue"
          error={error}
          submitting={submitting}
        />
      </OnboardingStep>
    </div>
  );
}
