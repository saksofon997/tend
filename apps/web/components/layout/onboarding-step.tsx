import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  description,
  children,
  footer,
}: OnboardingStepProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[30rem] flex-col justify-center py-10">
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

      <h1 className="font-display text-3xl font-medium text-foreground">{title}</h1>
      {description ? <p className="mt-3 text-base text-muted-foreground">{description}</p> : null}

      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-8 flex flex-wrap gap-3">{footer}</div> : null}
    </main>
  );
}
