---
name: impeccable
description: Tend UI finish pass. Use after functional web or mobile UI work, or when asked to adapt, polish, critique, or audit Tend interfaces. Covers hierarchy, spacing, responsive/native layout, copy tone, empty/error states, accessibility, and design-system alignment. Not for backend-only tasks. Never run init, document, bolder, overdrive, delight, or colorize against Tend's quiet kitchen-counter identity.
---

# Impeccable (Tend)

Tend vendors this skill so cloud agents can finish UI without the pbakaus plugin. If that plugin is installed, still follow **this** file: Tend's brief wins.

## When to run

After functional UI or user-facing copy works — before marking the task complete:

1. **`adapt`** — fit the change to Tend's constraints and the target surface (web responsive or Expo native)
2. **`polish`** — shipping pass: type, spacing, states, a11y, copy

Load [reference/adapt.md](reference/adapt.md) then [reference/polish.md](reference/polish.md). Do not skip both on `apps/web/` or `apps/mobile/` UI.

## Context (do not invent a second system)

Read, in order, only what the change needs:

1. [`PRODUCT.md`](../../../PRODUCT.md) — register is **product**; Operate mode for app UI, Persuade only for the marketing landing page
2. [`docs/design/design-language.md`](../../../docs/design/design-language.md)
3. [`docs/design/components.md`](../../../docs/design/components.md) and existing components
4. [`docs/design/tokens.css`](../../../docs/design/tokens.css) for web

[`DESIGN.md`](../../../DESIGN.md) is a pointer only. Canonical design is `docs/design/`.

**Do not** run impeccable `init` or `document`. **Do not** rewrite `PRODUCT.md` or replace the linen/clay/sage palette. Warm paper is the committed identity, not a generic cream default to fight.

## Commands Tend allows

| Command | Use |
|---------|-----|
| `adapt` | Responsive web or Expo native layout; reuse tokens/components |
| `polish` | Final quality pass |
| `clarify` | Copy that already exists but fights product tone |
| `audit` | A11y / contrast / hit targets when those are the task |
| `quieter` / `distill` | Only if a screen got loud or crowded |

**Do not use:** `init`, `document`, `bolder`, `overdrive`, `delight`, `colorize`, `live` (blocks autonomy), or palette scripts.

## Non-negotiables

- No guilt UX: no red overdue, no "OVERDUE"/"LATE", no streaks, points, or nag loops
- Status labels: Fresh, Getting stale, Needs attention
- Reuse `apps/web/components/` (and mobile equivalents) before new markup
- User-facing strings go through i18n (`en` + `sr`)
- Motion stays subtle; honor `prefers-reduced-motion` on web

## If the full Impeccable plugin is present

You may follow its `adapt` / `polish` references **after** this file. Ignore cream/sand "AI default" warnings when they target Tend's tokens. Ignore UPDATE_AVAILABLE / CONTEXT_STALE / doctor unless the human asked.
