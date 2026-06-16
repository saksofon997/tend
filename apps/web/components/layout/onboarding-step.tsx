import {
  PROMO_CAPTION_DESCRIPTION_CLASS,
  PROMO_CAPTION_TITLE_CLASS,
} from "@/lib/carousel/promo-caption-layout";
import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Hide the step progress dots when another control (e.g. promo carousel) owns navigation. */
  showProgress?: boolean;
  /** Top-align content instead of vertically centering the step column. */
  align?: "center" | "start";
  /** Reserve fixed caption height so carousel-driven title/description do not shift layout. */
  stableCaption?: boolean;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  description,
  children,
  footer,
  showProgress = true,
  align = "start",
  stableCaption = false,
}: OnboardingStepProps) {
  return (
    <main
      className={cn(
        "mx-auto flex max-w-[30rem] flex-col",
        align === "start"
          ? "justify-start pb-10 pt-4"
          : "min-h-[calc(100vh-3.5rem)] justify-center py-10",
      )}
    >
      {showProgress ? (
        <div className="mb-8 flex justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={`step-${index + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index + 1 === step ? "bg-primary" : "bg-[var(--tend-bg-muted)]",
              )}
              aria-hidden
            />
          ))}
        </div>
      ) : null}

      <h1
        className={cn(
          "font-display text-3xl font-medium text-foreground",
          stableCaption && PROMO_CAPTION_TITLE_CLASS,
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "mt-3 text-base text-muted-foreground",
            stableCaption && PROMO_CAPTION_DESCRIPTION_CLASS,
          )}
        >
          {description}
        </p>
      ) : null}

      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-8 flex flex-wrap gap-3">{footer}</div> : null}
    </main>
  );
}
