export const ONBOARDING_TOTAL_STEPS = 4;

export const ONBOARDING_STEP_NUMBERS = {
  welcome: 1,
  choose: 2,
  preset: 3,
  itemForm: 4,
} as const;

export type OnboardingFlowStep = keyof typeof ONBOARDING_STEP_NUMBERS;
