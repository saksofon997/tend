import type { TranslationKey } from "@/lib/i18n/dictionaries";

export interface OnboardingPromoSlide {
  src: `/promo/${string}`;
  altKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export const ONBOARDING_PROMO_SLIDES: readonly OnboardingPromoSlide[] = [
  {
    src: "/promo/tend-remember.jpg",
    altKey: "promo.remember.alt",
    titleKey: "promo.remember.title",
    descriptionKey: "promo.remember.description",
  },
  {
    src: "/promo/tend-care.jpg",
    altKey: "promo.care.alt",
    titleKey: "promo.care.title",
    descriptionKey: "promo.care.description",
  },
  {
    src: "/promo/tend-reminder.jpg",
    altKey: "promo.reminder.alt",
    titleKey: "promo.reminder.title",
    descriptionKey: "promo.reminder.description",
  },
  {
    src: "/promo/tend-friend-promo.png",
    altKey: "promo.friend.alt",
    titleKey: "promo.friend.title",
    descriptionKey: "promo.friend.description",
  },
  {
    src: "/promo/tend-activity.jpg",
    altKey: "promo.activity.alt",
    titleKey: "promo.activity.title",
    descriptionKey: "promo.activity.description",
  },
] as const;
