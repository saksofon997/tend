export interface OnboardingPromoSlide {
  src: `/promo/${string}`;
  alt: string;
  title: string;
  description: string;
}

export const ONBOARDING_PROMO_SLIDES: readonly OnboardingPromoSlide[] = [
  {
    src: "/promo/tend-remember.jpg",
    alt: "Tend home screen showing gentle attention for recurring life care, without overdue badges",
    title: "The stuff that drifts, remembered softly.",
    description:
      "Household care, health, relationships, and life admin, gathered without overdue badges.",
  },
  {
    src: "/promo/tend-care.jpg",
    alt: "Tend onboarding screen for picking a first item to tend",
    title: "Begin with one small act of care.",
    description:
      "Onboarding is a soft prompt, not a setup project. Pick one recurring thing and move on.",
  },
  {
    src: "/promo/tend-reminder.jpg",
    alt: "Tend reminder banner surfacing items that could use attention with calm context",
    title: "A reminder can be gentle and still useful.",
    description:
      "Tend surfaces what matters with context: name, rhythm, and the last time you cared for it.",
  },
  {
    src: "/promo/tend-friend-promo.png",
    alt: "Tend promo mockup showing a dinner Tend shared with a friend",
    title: "Some care is easier to share.",
    description:
      "Add a friend's email to a Tend so dinner, check-ins, or shared routines can appear for both of you.",
  },
  {
    src: "/promo/tend-activity.jpg",
    alt: "Tend activity feed showing recent tending events without scores or streaks",
    title: "Care leaves a quiet trail.",
    description: "Recent activity makes maintenance visible without turning it into a score.",
  },
] as const;
