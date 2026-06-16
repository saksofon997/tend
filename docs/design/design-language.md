# Tend Design Language

A visual and interaction language for a life-maintenance app that feels calm, honest, and useful — never like a productivity tool or guilt-driven todo list.

---

## 1. Design principles

These come directly from the MVP product rules. Every UI decision should pass at least one of these checks.

| Principle | What it means in UI |
|-----------|---------------------|
| **Awareness, not pressure** | Surfaces drift with neutral language ("11 days ago", "Getting stale"). No countdown timers, no "OVERDUE" badges, no red. |
| **Straightforward** | One primary action per screen region. No kanban, projects, labels, or nested navigation. |
| **Fast to scan** | Home answers one question: *what could use attention now?* Hierarchy is status → type → age. |
| **Gentle by default** | Mild palette, soft borders, generous whitespace. Stronger emphasis only for `must` items that need attention. |
| **Honest metadata** | Show rhythm, last tended, and type openly. The user should understand *why* something is surfaced. |
| **Sparse musts** | Must/Want selector includes guidance copy. Must styling is noticeable but not alarming. |

### Anti-patterns (do not build)

- Red, orange alarm colors for stale items
- Streak counters, points, progress rings
- Checkbox todo lists with due dates
- Dense data tables or analytics charts
- Modal nag loops for reminders
- Harsh validation (shake animations, loud error banners)

---

## 2. Visual personality

**One-line summary:** *A quiet kitchen counter note — warm paper, soft pencil, clear handwriting.*

- **Mild colors:** Warm neutrals (linen, clay, sage). Status uses muted earth tones, not traffic lights.
- **Subtle inputs:** Hairline borders, filled backgrounds only on focus. No heavy box shadows on fields.
- **Gentle fonts:** Serif display for warmth; sans body for clarity. Never ultra-condensed or monospace UI.
- **Straightforward layout:** Single-column content, clear section headers, obvious primary buttons.

---

## 3. Typography

### Font pairing

Load in `app/layout.tsx` via `next/font/google`:

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| Display | **Newsreader** | 400, 500, 600 | Page titles, hero text, onboarding headlines |
| Body / UI | **DM Sans** | 400, 500, 600 | Body copy, labels, buttons, list items |
| Mono (optional) | **DM Mono** | 400 | Time ranges in availability editor only |

```tsx
// layout.tsx pattern
import { DM_Sans, Newsreader } from "next/font/google";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
```

Apply: `className={`${display.variable} ${body.variable} font-body`}` on `<body>`.

### Type scale

| Token | Size | Weight | Font | Example |
|-------|------|--------|------|---------|
| `text-3xl` | 30px | 500 | display | "Welcome to Tend" |
| `text-2xl` | 24px | 500 | display | Home page title |
| `text-xl` | 20px | 500 | display | Section: "Needs attention" |
| `text-lg` | 18px | 500 | body | Item card title |
| `text-base` | 16px | 400 | body | Body paragraphs, form labels |
| `text-sm` | 14px | 400 | body | Metadata ("every 7 days") |
| `text-xs` | 12px | 500 | body | Badges, chip labels |

### Copy tone

| Context | Do | Don't |
|---------|-----|-------|
| Status | "Getting stale", "Needs attention" | "Overdue", "Late", "Missed" |
| Age | "Last tended 11 days ago" | "11 days overdue" |
| Reminders | "Bed sheets could use attention" | "You forgot bed sheets!" |
| Empty state | "Nothing needs attention right now" | "All caught up! 🎉" |
| Errors | "Enter a valid email address" | "Invalid input!" |
| Must guidance | "Use must sparingly — for things that truly can't drift" | "Must = urgent!!!" |

---

## 4. Color system

All values live in [`tokens.css`](./tokens.css). Use semantic tokens, not raw hex, in components.

### Surfaces

```
Page          → --tend-bg (#f7f5f2 linen)
Card          → --tend-bg-elevated (#fff)
Inset section → --tend-bg-muted
List hover    → --tend-bg-subtle
```

### Status colors

Status communicates drift, not failure. Wants never look "broken."

| Status | Text token | Background token | When |
|--------|------------|------------------|------|
| Fresh | `--tend-status-fresh` | `--tend-status-fresh-bg` | Within half the rhythm |
| Getting stale | `--tend-status-stale` | `--tend-status-stale-bg` | Past half rhythm, within full rhythm |
| Needs attention | `--tend-status-attention` | `--tend-status-attention-bg` | Past full rhythm |

**Must + needs attention:** Use status colors *plus* a left border accent in `--tend-type-must-border` (4px). This is the strongest emphasis in the app — still not red.

### Type colors

| Type | Accent | Background | Border |
|------|--------|------------|--------|
| Want | `--tend-type-want` | `--tend-type-want-bg` | `--tend-type-want-border` |
| Must | `--tend-type-must` | `--tend-type-must-bg` | `--tend-type-must-border` |

Must items sort above wants when both need attention. Visual weight follows that rule.

### Life area chips (optional filter)

Use neutral chip styling; area-specific color is not required for MVP. If adding color later, keep each area within the same muted saturation as status tokens.

| Area | Suggested muted accent |
|------|------------------------|
| household | `#8a9a7b` |
| health | `#7a9a8f` |
| relationships | `#9a8a7b` |
| pets | `#8a8a9a` |
| vehicle | `#7a8a9a` |
| admin | `#8a8580` |
| personal | `#9a858f` |

---

## 5. Spacing & layout

### Grid

4px base unit. Prefer `--tend-space-4` (16px) as default padding inside cards; `--tend-space-6` (24px) between sections.

### Page structure

```
┌─────────────────────────────────────────┐
│ AppShell header (logo, nav, user)       │
├─────────────────────────────────────────┤
│                                         │
│   PageHeader (title + subtitle)         │
│                                         │
│   [ max-width: 640px, centered ]        │
│                                         │
│   Section 1                             │
│   Section 2                             │
│                                         │
└─────────────────────────────────────────┘
```

- **Content max width:** `640px` (`--tend-content-max`) for home and lists
- **Form max width:** `768px` (`--tend-content-wide`) for item create/edit
- **Mobile:** Full bleed with `16px` horizontal padding; no side nav

### Section rhythm

Each attention section on home:

1. Section header (`text-xl`, display font) + optional count
2. `12px` gap
3. Stack of `TendItemCard` with `8px` gap between cards
4. `32px` gap before next section

---

## 6. Elevation & borders

Tend is mostly **flat**. Depth is communicated through background shifts, not shadows.

| Element | Treatment |
|---------|-----------|
| Cards | `1px` border `--tend-border`, `radius-lg`, optional `--tend-shadow-sm` |
| Inputs | `1px` border `--tend-border-subtle`, no shadow; focus ring `2px` `--tend-border-focus` |
| Modals / sheets | `--tend-shadow-lg`, `radius-xl` |
| Buttons | No shadow; filled primary or ghost secondary |

---

## 7. Motion

Subtle and functional. No bounce, no confetti.

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 120ms | `--tend-ease` |
| Focus ring | 120ms | `--tend-ease` |
| Card hover bg | 200ms | `--tend-ease` |
| Section expand | 200ms | `--tend-ease` |
| Mark tended success | 320ms | opacity fade on card (optional) |

Honor `prefers-reduced-motion: reduce` — tokens zero out durations.

---

## 8. Iconography

Use **Lucide React** (ships with shadcn). Stroke width 1.5, size 16–20px inline with text.

| Concept | Icon |
|---------|------|
| Mark tended | `Check` or `Leaf` |
| Add item | `Plus` |
| Edit | `Pencil` |
| Archive | `Archive` |
| Delete | `Trash2` |
| Settings / availability | `Clock` |
| Must indicator | `CircleDot` (small, in badge) |
| Reminder | `Bell` (outline only, never filled red) |

---

## 9. Screen patterns

Maps to routes in `docs/pre-alpha-development-plan.md`.

### Auth (`/login`, `/register`)

- Centered card on linen background
- Short pre-alpha disclaimer in `text-sm` muted
- Single-column form, `FormField` stack
- Primary button full width

### Onboarding (`/onboarding`)

- Full-page steps, no chrome beyond logo
- One decision per step (welcome → choose path → form/presets)
- Skip always visible as ghost button, never hidden
- Progress: subtle step dots, not a progress bar

### Home (`/`)

```
─────────────────────────────────────
Needs attention          [count]
  TendItemCard × n
Getting stale            [count]
  TendItemCard × n
Looking good             [count]
  TendItemCard × n (collapsed by default if >3)
─────────────────────────────────────
ReminderBanner (if eligible)
LifeAreaFilter chips
FAB or header "Add" → /items/new
```

### Item detail (`/items/[id]`)

- Header: name + `StatusBadge` + `TypeBadge`
- Metadata block: rhythm, last tended (`RelativeTime`), life area
- Primary: `MarkTendedButton` (full width)
- Secondary: Edit, Archive
- Recent events list (simple, no charts)

### Quick add (`/items/new`)

- Same fields as onboarding item form
- `TypeSelector` with must guidance callout
- `RhythmSelect`, optional life area, last tended date

### Presets (`/presets` or modal)

- `TabList` for life areas
- `PresetCard` grid/list — tap opens edit form pre-filled

### Availability (`/settings/availability`)

- Per-day rows: day label + time window inputs
- Empty days are fine — show muted "No windows"
- Save is explicit; no auto-save toast spam

### Activity (`/activity`)

- Flat list: item name + tended date
- Tap to correct — no streaks, no stats

---

## 10. Accessibility

- Minimum touch target: `44×44px` for primary actions
- Focus visible on all interactive elements (ring token)
- Status never conveyed by color alone — always paired with text label
- `role="alert"` on form errors; `aria-live="polite"` when marking tended updates list
- Contrast: body text `#2c2925` on `#f7f5f2` ≈ 11:1 ✓; status text tokens all ≥ 4.5:1 on their backgrounds

---

## 11. shadcn theming notes

When initializing shadcn, map component defaults to Tend tokens:

```css
/* globals.css — after importing tokens.css */
@theme inline {
  --font-sans: var(--tend-font-body);
  --font-serif: var(--tend-font-display);
}
```

Override shadcn `destructive` to use `--tend-error` (muted brick). Do not use default bright red.

Recommended shadcn components to install first: `button`, `input`, `label`, `select`, `card`, `badge`, `dialog`, `tabs`, `separator`, `alert`.

---

## 12. Reference mood

Think: **paper planner on a wooden table**, not **SaaS dashboard**.

- Warm, lived-in, unhurried
- Information density: low on home, medium on forms
- Delight from clarity and copy, not animation or gamification
