# Tend Design System

Design language and component specs for the Tend web app (Next.js 15 + React 19).

**Audience:** Implementation agents building UI in `apps/web/`.

## Agent instructions

This spec is wired into Cursor change instructions:

| Rule | Scope | Purpose |
|------|-------|---------|
| [`implementation-workflow.mdc`](../../.cursor/rules/implementation-workflow.mdc) | Always | Checklist step 5 + UI order of operations |
| [`autonomy.mdc`](../../.cursor/rules/autonomy.mdc) | Always | Proceed by default; stop only for product gates |
| [`ui-design.mdc`](../../.cursor/rules/ui-design.mdc) | `apps/web/**/*.{tsx,css}` | Design spec, reusable components, styling rules, final polish |
| [impeccable skill](../../.cursor/skills/impeccable/SKILL.md) | UI finish | Tend-constrained `adapt` + `polish` |

**Before any UI or copy work:** read [`PRODUCT.md`](../../PRODUCT.md) for product direction, then this README, `design-language.md`, and the relevant entries in `components.md`. UI and wording must stay aligned with both the design language and product constraints (calm, no guilt-driven UX, not a task manager). Reuse existing components in `apps/web/components/` before writing new markup.

**Before marking UI work complete:** load [`.cursor/skills/impeccable/SKILL.md`](../../.cursor/skills/impeccable/SKILL.md) and run **`adapt`** then **`polish`** on the changed screens or components — a final touch-up pass for hierarchy, spacing, copy, states, and accessibility within Tend's design constraints. Do not run impeccable `init` or `document`.

## Documents

| Doc | Purpose |
|-----|---------|
| [design-language.md](./design-language.md) | Principles, tokens, typography, color, motion, copy tone |
| [components.md](./components.md) | Component catalog with props, anatomy, and screen mapping |
| [tokens.css](./tokens.css) | CSS custom properties — imported by `apps/web/app/globals.css` |
| [component-types.ts](./component-types.ts) | TypeScript prop contracts (reference) |

## Intended stack

Per `docs/pre-alpha-development-plan.md`:

- **Tailwind CSS 4** for utility styling
- **shadcn-style primitives** in `components/ui/` (Button, Input, Select, Calendar, Carousel, Dialog, etc.)
- **CSS variables** from `tokens.css` as the single source of truth for color, type, and spacing

Do not introduce a second token system. Extend theme variables to map to Tend tokens.

## Reusable components

**Default:** compose screens from existing components. **Exception:** truly one-off glue.

| Layer | Path | Examples |
|-------|------|----------|
| Primitives | `components/ui/` | `Button`, `Input`, `Card`, `Alert`, `Badge` |
| Layout | `components/layout/` | `AppShell`, `PageHeader`, `OnboardingStep`, `AuthLayout` |
| Domain | `components/tend/` | `TendItemCard`, `StatusBadge`, `AttentionSection`, `HomeView` |
| Forms | `components/forms/` | `AuthForm`, `ItemForm`, `FormField`, `TypeSelector` |

When adding a pattern used in more than one place:

1. Implement in the correct layer
2. Add props + usage to `components.md`
3. Replace duplicate inline markup on other screens

## Implementation status

Foundation, attention home, item detail, availability, in-app reminders, activity, check in, and reflections are implemented. Extend `components.md` when adding catalog entries; do not rebuild those screens from scratch.

## File layout

```
apps/web/
├── app/
│   ├── globals.css          # imports tokens.css + tailwind
│   └── layout.tsx           # fonts (Fraunces + Nunito)
├── components/
│   ├── ui/                  # primitives
│   ├── layout/              # AppShell, PageHeader, …
│   ├── tend/                # domain components
│   └── forms/               # AuthForm, ItemForm, …
└── lib/
    └── design/              # status-labels, relative-time helpers
```

## Domain types to import

```ts
import type { TendItemType, TendStatus, LifeArea } from "@tend/domain";
```

Status values are snake_case in code; labels are title case in UI:

| Code | Label |
|------|-------|
| `fresh` | Fresh |
| `getting_stale` | Getting stale |
| `needs_attention` | Needs attention |
