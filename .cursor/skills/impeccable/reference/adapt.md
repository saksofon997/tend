# adapt (Tend)

Fit the changed UI to Tend and to the device classes that actually ship. This is not a redesign.

## Web (`apps/web/`)

1. Reuse components in `apps/web/components/` (`ui/`, `layout/`, `tend/`, `forms/`, `marketing/`). New markup only when no catalog entry fits.
2. Tokens from `docs/design/tokens.css` via Tailwind theme vars — no ad-hoc hex, no second type scale.
3. Check the changed route at a narrow phone width and a desktop content width. No horizontal overflow; primary action reachable without hunting.
4. Hierarchy: status → type → age on attention surfaces. One primary action per region.
5. Must items may be stronger than wants; never alarm-red.

## Mobile (`apps/mobile/`)

1. Native affordances (safe area, keyboard avoiding, touch targets ≥ 44pt). Do not paste web Tailwind into React Native.
2. Align copy, status language, and grouping with web. Prefer `t()` and `apps/mobile/src/i18n/`.
3. Fonts and assets from `apps/mobile/assets/` via `require()` — not `@expo-google-fonts/*`.
4. After layout changes, `bun run verify` from `apps/mobile/` must still pass.

## Stop conditions

If adapt would invent a new visual world, new status language, or guilt/pressure patterns, stop per `.cursor/rules/autonomy.mdc`. Otherwise apply the fit and continue to polish.
