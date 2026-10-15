export const fonts = {
  display: "Newsreader_500Medium",
  displayRegular: "Newsreader_400Regular",
  displaySemibold: "Newsreader_600SemiBold",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemibold: "DMSans_600SemiBold",
} as const;

export const colors = {
  // Keep in sync with docs/design/tokens.css.
  bg: "#E8DDCA",
  card: "#F4EDE1",
  muted: "#EEE5D7",
  subtle: "#E5D9C8",
  raised: "#F8F2E8",
  border: "#CFC2AD",
  borderSubtle: "#DDD2C1",
  text: "#3F382F",
  textMuted: "#696154",
  textSubtle: "#8B8174",
  inverse: "#F4EDE1",
  primary: "#596D55",
  primaryPressed: "#485A45",
  primaryMuted: "#E2E5DC",
  sage: "#A2AD92",
  sageDark: "#75876D",
  secondary: "#75876D",
  secondaryMuted: "#E2E5DC",
  shared: "#75876D",
  sharedBg: "#E2E5DC",
  sharedBorder: "#A2AD92",
  wood: "#9B8168",
  vermilion: "#925B51",
  fresh: "#485A45",
  freshBg: "#E2E5DC",
  stale: "#7A6450",
  staleBg: "#F8F2E8",
  attention: "#7A4E46",
  attentionBg: "#E8DAD4",
  paper: "#EEE5D7",
  paperLine: "#D7CCBA",
  paperMargin: "#B88F86",
  must: "#7A4E46",
  mustBg: "#E8DAD4",
  mustBorder: "#B88F86",
  want: "#485A45",
  wantBg: "#E2E5DC",
  wantBorder: "#A2AD92",
  error: "#925B51",
  errorBg: "#E8DAD4",
} as const;

/** Morning dew. Translucent ivory over parchment; no blur on native lists. */
export const dew = {
  surface: "rgba(248, 242, 232, 0.58)",
  surfaceStrong: "rgba(248, 242, 232, 0.78)",
  border: "rgba(255, 250, 240, 0.55)",
  highlight: "rgba(255, 255, 255, 0.35)",
  fallback: "#F8F2E8",
} as const;

export const dewSoft = {
  backgroundColor: dew.surface,
  borderColor: dew.border,
  borderWidth: 1,
} as const;

export const dewRaised = {
  backgroundColor: dew.surfaceStrong,
  borderColor: dew.border,
  borderWidth: 1,
  shadowColor: "#3F382F",
  shadowOpacity: 0.07,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 16,
  chip: 18,
  round: 999,
};

export const thoughtRadius = {
  borderRadius: 16,
} as const;
