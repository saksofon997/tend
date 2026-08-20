# polish (Tend)

Final pass on the screens or components you changed. Bounded: one inspect, one fix batch, stop.

## Checklist

- **Type:** Display (Fraunces) for titles on web; body/UI (Nunito). Mobile matches the established theme. No extra font families.
- **Spacing:** Consistent with nearby screens; generous, not sparse-to-the-point-of-lost. No nested cards.
- **Copy:** Warm, honest, useful. Status and empty states from the design language. No urgency theater.
- **States:** Default, empty, error, loading (if the flow can wait), disabled. Errors are calm and actionable.
- **A11y:** Contrast from tokens; labels not color-only; keyboard on web; screen-reader labels on icon-only controls.
- **i18n:** Every new string in `en` and `sr`.
- **Motion:** Subtle or none. No bounce, shake, or confetti.

## Out of scope

Do not restyle unrelated pages. Do not add decorative illustration, loud gradients, or "delight" that reads as a habit tracker. Do not bump `version.json` unless the task is a release.
