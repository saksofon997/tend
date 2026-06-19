# Tend Component Catalog

Implementation specs for React components in `apps/web/components/`. Each entry includes file path, props, anatomy, states, and which user stories / routes use it.

**Convention:** Primitives in `ui/` (shadcn-themed). Domain components in `tend/`. Layout in `layout/`. Forms in `forms/`.

---

## Quick reference

| Component | File | Stories |
|-----------|------|---------|
| [AppShell](#appshell) | `layout/app-shell.tsx` | All |
| [SiteFooter](#sitefooter) | `layout/site-footer.tsx` | 1, All |
| [LanguageSelect](#languageselect) | `layout/language-select.tsx` | 1 |
| [LandingPage](#landingpage) | `marketing/landing-page.tsx` | 1 |
| [LegalPage](#legalpage) | `marketing/legal-page.tsx` | 1 |
| [TendLogoLink](#tendlogolink) | `layout/tend-logo-link.tsx` | 1, All |
| [UserMenu](#usermenu) | `layout/user-menu.tsx` | All |
| [PageHeader](#pageheader) | `layout/page-header.tsx` | All pages |
| [Button](#button) | `ui/button.tsx` | All |
| [DropdownMenu](#dropdownmenu) | `ui/dropdown-menu.tsx` | All |
| [FormField](#formfield) | `forms/form-field.tsx` | 1, 3, 8, 10 |
| [Input](#input) | `ui/input.tsx` | 1, 3, 8 |
| [PasswordInput](#passwordinput) | `forms/password-input.tsx` | 1 |
| [Select](#select) | `ui/select.tsx` | 3, 4, 8, 13 |
| [Card](#card) | `ui/card.tsx` | 1, 5, 6 |
| [Alert](#alert) | `ui/alert.tsx` | 1, 11 |
| [StatusBadge](#statusbadge) | `tend/status-badge.tsx` | 5, 6, 11 |
| [TypeBadge](#typebadge) | `tend/type-badge.tsx` | 5, 6, 12 |
| [RelativeTime](#relativetime) | `tend/relative-time.tsx` | 5, 6, 11, 14 |
| [TendItemCard](#tenditemcard) | `tend/tend-item-card.tsx` | 5, 7, 11 |
| [AttentionSection](#attentionsection) | `tend/attention-section.tsx` | 5 |
| [MarkTendedButton](#marktendedbutton) | `tend/mark-tended-button.tsx` | 7, 11 |
| [TypeSelector](#typeselector) | `forms/type-selector.tsx` | 3, 8, 12 |
| [RhythmSelect](#rhythmselect) | `forms/rhythm-select.tsx` | 3, 4, 8 |
| [LifeAreaChip](#lifeareachip) | `tend/life-area-chip.tsx` | 4, 13 |
| [LifeAreaFilter](#lifeareafilter) | `tend/life-area-filter.tsx` | 13 |
| [PresetCard](#presetcard) | `tend/preset-card.tsx` | 4 |
| [PresetSuggestions](#presetsuggestions) | `tend/preset-suggestions.tsx` | 3, 4 |
| [TabList](#tablist) | `ui/tabs.tsx` | 4 |
| [ReminderBanner](#reminderbanner) | `tend/reminder-banner.tsx` | 11 |
| [EmptyState](#emptystate) | `tend/empty-state.tsx` | 5, 14 |
| [ActivityListItem](#activitylistitem) | `tend/activity-list-item.tsx` | 14 |
| [AvailabilityEditor](#availabilityeditor) | `forms/availability-editor.tsx` | 10 |
| [ConfirmDialog](#confirmdialog) | `ui/dialog.tsx` | 9 |
| [AuthForm](#authform) | `forms/auth-form.tsx` | 1 |
| [ItemForm](#itemform) | `forms/item-form.tsx` | 3, 4, 8 |
| [ItemDetailView](#itemdetailview) | `tend/item-detail-view.tsx` | 6, 7, 8, 14 |
| [TendEventRow](#tendeventrow) | `tend/tend-event-row.tsx` | 6, 14 |
| [OnboardingStep](#onboardingstep) | `layout/onboarding-step.tsx` | 2 |
| [OnboardingLayout](#onboardinglayout) | `layout/onboarding-layout.tsx` | 2 |
| [PromoCarousel](#promocarousel) | `onboarding/promo-carousel.tsx` | 2 |

---

## Layout

### AppShell

**File:** `components/layout/app-shell.tsx`

**Purpose:** Persistent chrome — logo, primary nav, user menu.

```tsx
interface AppShellProps {
  children: React.ReactNode;
  user?: { displayName: string };
}
```

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│ [Tend logo]     Home  Activity  Settings  ▾  │  ← header, h-14, border-b
├──────────────────────────────────────────────┤
│  {children}                                   │
├──────────────────────────────────────────────┤
│  Privacy · Terms · App/API version · Release  │  ← SiteFooter
└──────────────────────────────────────────────┘
```

**Styles:**
- Header: `--tend-bg-elevated`, bottom border `--tend-border`, full-width bar
- Header and page body share `.tend-content-column` (`max-width: 640px`, centered, `padding-inline: 16px`)
- Logo: `TendLogoLink` image (`/promo/tend-logo.png`), `h-7` in the shell header
- Nav links: centered in the column; `text-sm`, muted default, primary color when active
- User menu: `UserMenu` dropdown in the header trailing slot (sign out today; expandable)

**Notes:** Hide full nav during onboarding. Auth pages use `AuthLayout` with `SiteFooter`.

---

### SiteFooter

**File:** `components/layout/site-footer.tsx`

**Purpose:** Legal links, app/API version labels, and a quiet app release link on public and app surfaces.

**Links:** Privacy (`/privacy`), Terms (`/terms`), app/API version labels (from `version.json`), and app release link.

**Used in:** `AppShell`, `AuthLayout`, `LandingPage`, `LegalPage`.

---

### TendLogoLink

**File:** `components/layout/tend-logo-link.tsx`

Linked Tend wordmark image. Used in `AppShell`, `AuthLayout`, and anywhere the brand mark links home.

### LanguageSelect

**File:** `components/layout/language-select.tsx`

Native select for public language switching. Used in the landing header near sign in. Authenticated app language switching lives inside `UserMenu` as radio items.

---

### UserMenu

**File:** `components/layout/user-menu.tsx`

Account dropdown in the app header. Contains language radio items above **Sign out**.

---

### PageHeader

**File:** `components/layout/page-header.tsx`

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode; // e.g. "Add" button
}
```

**Styles:**
- Title: `text-2xl`, display font, `--tend-text`
- Subtitle: `text-sm`, `--tend-text-muted`, `mt-1`
- Action: right-aligned on desktop, below title on mobile
- Bottom margin: `--tend-space-6`

---

### OnboardingStep

**File:** `components/layout/onboarding-step.tsx`

```tsx
interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Back / Skip / Continue buttons
}
```

**Anatomy:** Centered column, `max-w-[480px]`. Step dots (`totalSteps` wide, current filled). No heavy progress bar.

**Stories:** 2, 4

---

### OnboardingLayout

**File:** `components/layout/onboarding-layout.tsx`

**Purpose:** Shared onboarding shell — page background, `max-w-[30rem]` column, and `TendLogoLink` header on every step.

```tsx
interface OnboardingLayoutProps {
  children: React.ReactNode;
}
```

**Anatomy:** Full-height background, logo row (`pt-6`), then step content. Pair with `OnboardingStep` (top-aligned by default).

---

### PromoCarousel

**File:** `components/onboarding/promo-carousel.tsx`

**Purpose:** Swipeable promo screenshot carousel on onboarding welcome step. Uses `/promo/tend-*.jpg` assets; `tend-remember.jpg` is always first.

```tsx
interface PromoCarouselProps {
  slides: readonly OnboardingPromoSlide[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}
```

**Stories:** 2 (welcome step)

---

## Primitives (shadcn-themed)

### Button

**File:** `components/ui/button.tsx` (shadcn)

Extend shadcn variants:

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| `default` | `--tend-primary` | inverse | none | Primary actions |
| `secondary` | `--tend-secondary-muted` | `--tend-text` | `--tend-border` | Back, cancel |
| `ghost` | transparent | `--tend-text-muted` | none | Skip, low emphasis |
| `destructive` | `--tend-error-bg` | `--tend-error` | `--tend-error` 1px | Delete confirm only |

**Sizes:** `sm` (32px), `default` (40px), `lg` (44px)

**States:** `disabled` → 50% opacity, no pointer. `loading` → spinner + "Saving…" label pattern.

---

### DropdownMenu

**File:** `components/ui/dropdown-menu.tsx`

Radix-based menu panel for compact actions (e.g. account menu in `AppShell`). Matches card elevation and border tokens.

---

### Input

**File:** `components/ui/input.tsx`

**Styles:**
- Height: `40px`
- Background: `--tend-bg-elevated`
- Border: `1px solid --tend-border-subtle`
- Radius: `--tend-radius-md`
- Padding: `12px`
- Font: body, `text-base`
- Placeholder: `--tend-text-subtle`
- Focus: border `--tend-border-focus`, ring `2px` offset

**Types used:** `text`, `email`, `password`, `date`

---

### PasswordInput

**File:** `components/forms/password-input.tsx`

Password field with a show/hide toggle. Same visual treatment as `Input`, with right padding for the toggle button.

Used in `AuthForm` for password and confirm-password fields (register) and sign-in password.

---

### Select

**File:** `components/ui/select.tsx` (shadcn Radix)

Same visual treatment as Input. Chevron icon muted. Dropdown panel: elevated card with `--tend-shadow-md`.

---

### Card

**File:** `components/ui/card.tsx`

```tsx
// shadcn Card + CardHeader + CardContent + CardFooter
```

- Background: `--tend-bg-elevated`
- Border: `1px --tend-border`
- Radius: `--tend-radius-lg`
- Padding: `--tend-space-4` (content), `--tend-space-5` (header)

Used for: auth forms, preset picker container.

---

### Alert

**File:** `components/ui/alert.tsx`

| Variant | Background | Icon color | Usage |
|---------|------------|------------|-------|
| `info` | `--tend-info-bg` | `--tend-info` | Must guidance, pre-alpha notes |
| `error` | `--tend-error-bg` | `--tend-error` | Form validation |
| `reminder` | `--tend-status-stale-bg` | `--tend-status-stale` | In-app reminders |

No warning variant with yellow/red — use `reminder` or `info`.

---

### FormField

**File:** `components/forms/form-field.tsx`

```tsx
interface FormFieldProps {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  counter?: { length: number; max: number };
  children: React.ReactNode; // Input or Select
}
```

**Anatomy:**
```
Label (text-base, medium)     [optional *]
Helper (text-sm, muted)       — if helper
{children}
Footer row                    — if counter and/or error
  Error (text-sm, error)      — left, if error
  Counter (text-xs, muted)    — right, e.g. 85/200; destructive at max
```

**Spacing:** `16px` between fields. Label `4px` above control.

**Stories:** 1, 3, 8, 10

---

## Marketing

### LandingPage

**File:** `components/marketing/landing-page.tsx`

**Purpose:** Public landing at `/` for unauthenticated visitors. Value prop, product preview carousel (`LandingPromoPreview` + `PromoCarousel`), differentiation copy, Register + Sign in CTAs.

**Routes:** `/` (when no session)

---

### LandingPromoPreview

**File:** `components/marketing/landing-promo-preview.tsx`

**Purpose:** Client wrapper for the landing hero product preview. Manages carousel state and shows slide title + description beneath `PromoCarousel`.

**Used in:** `LandingPage`

---

### LegalPage

**File:** `components/marketing/legal-page.tsx`

**Purpose:** Renders sample Privacy or Terms markdown with alpha disclaimer banner.

```tsx
interface LegalPageProps {
  slug: "privacy" | "terms";
}
```

**Routes:** `/privacy`, `/terms`

---

## Domain components

### StatusBadge

**File:** `components/tend/status-badge.tsx`

```tsx
import type { TendStatus } from "@tend/domain";

interface StatusBadgeProps {
  status: TendStatus;
  size?: "sm" | "md";
}
```

**Label map:**
```ts
const STATUS_LABELS: Record<TendStatus, string> = {
  fresh: "Fresh",
  getting_stale: "Getting stale",
  needs_attention: "Needs attention",
};
```

**Styles:**
| Status | Text | BG |
|--------|------|-----|
| `fresh` | `--tend-status-fresh` | `--tend-status-fresh-bg` |
| `getting_stale` | `--tend-status-stale` | `--tend-status-stale-bg` |
| `needs_attention` | `--tend-status-attention` | `--tend-status-attention-bg` |

- `sm`: `text-xs`, padding `4px 8px`, radius `--tend-radius-sm`
- `md`: `text-sm`, padding `6px 10px`

Always render text label — never color-only.

---

### TypeBadge

**File:** `components/tend/type-badge.tsx`

```tsx
interface TypeBadgeProps {
  type: TendItemType; // "must" | "want"
  size?: "sm" | "md";
}
```

| Type | Label | Accent |
|------|-------|--------|
| `want` | Want | `--tend-type-want` on `--tend-type-want-bg` |
| `must` | Must | `--tend-type-must` on `--tend-type-must-bg` |

Optional `CircleDot` icon (12px) before label for must.

---

### RelativeTime

**File:** `components/tend/relative-time.tsx`

```tsx
interface RelativeTimeProps {
  date: Date | string | null;
  prefix?: string; // default: "Last tended"
}
```

**Output examples:**
- `Last tended today`
- `Last tended 2 days ago`
- `Last tended 11 days ago`
- `Never tended` (null date)

**Styles:** `text-sm`, `--tend-text-muted`. Never append "overdue".

```ts
// lib/design/relative-time.ts — implementation helper
export function formatRelativeTended(date: Date | null, now: Date): string;
```

---

### TendItemCard

**File:** `components/tend/tend-item-card.tsx`

The primary list unit on home and reminders.

```tsx
interface TendItemCardProps {
  id: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  lastTendedAt: Date | string | null;
  rhythmDays: number;
  lifeArea?: LifeArea | null;
  onTend?: (id: string) => void;
  onClick?: (id: string) => void;
  loading?: boolean;
}
```

**Anatomy:**
```
┌─────────────────────────────────────────────────┐
│ [Name text-lg medium]                           │
│ [TypeBadge]  [RelativeTime]                     │
│ [StatusBadge]                     [Mark tended] │
└─────────────────────────────────────────────────┘
```

**Layout:** Single-column stack. Name and metadata are grouped first; status and action sit in a second row below, with status left and `MarkTendedButton` right.

**Variants:**
- **Default:** Card border, white bg
- **Must + needs_attention:** Add `border-l-4 border-l-[--tend-type-must-border]` and `--tend-type-must-bg` tint
- **Looking good section:** Slightly reduced opacity (0.85) optional

**Interaction:**
- Whole card clickable → `/items/[id]` except Mark tended button
- Mark tended: `MarkTendedButton` inline, stops propagation

**Stories:** 5, 7, 11

---

### AttentionSection

**File:** `components/tend/attention-section.tsx`

```tsx
interface AttentionSectionProps {
  title: string; // "Needs attention" | "Getting stale" | "Looking good"
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
```

**Styles:**
- Header: `text-xl` display font + count in `text-sm` muted pill
- Collapsible when `count === 0` — show muted empty line instead of hiding section entirely on home
- `32px` margin below section

---

### MarkTendedButton

**File:** `components/tend/mark-tended-button.tsx`

```tsx
interface MarkTendedButtonProps {
  itemId: string;
  onTend: (id: string) => Promise<void>;
  size?: "sm" | "default" | "lg";
  className?: string;
}
```

- Label: "Mark tended" (not "Complete" or "Done")
- Loading: "Updating…"
- Confirmation: "Tended" for less than 1 second when the parent surface does not immediately remove the item
- Icon: `Check` 16px before label
- Variant: `default` (primary green)
- Motion: subtle hover lift and check scale, using Tend duration tokens and respecting reduced motion
- On success: parent removes card from section when appropriate (optimistic update encouraged)

---

### TypeSelector

**File:** `components/forms/type-selector.tsx`

```tsx
interface TypeSelectorProps {
  value: TendItemType;
  onChange: (type: TendItemType) => void;
}
```

**Anatomy:** Two side-by-side selectable cards (not a bare `<select>` on create/edit flows):

```
┌─────────────────────┐  ┌─────────────────────┐
│ Want                │  │ Must                │
│ Flexible, no guilt  │  │ Important, stronger │
│ if it drifts        │  │ reminders           │
└─────────────────────┘  └─────────────────────┘
```

Selected state: border `2px` type accent color, tinted background.

Below both: `Alert` variant `info` — "Use must sparingly for things that truly can't drift."

**Stories:** 3, 8, 12

---

### RhythmSelect

**File:** `components/forms/rhythm-select.tsx`

```tsx
interface RhythmSelectProps {
  value: number; // rhythmDays
  onChange: (days: number) => void;
  options?: { days: number; label: string }[];
}
```

Default options from `@/lib/onboarding/constants` `RHYTHM_OPTIONS` (Daily through Monthly). Includes a **Custom interval** option that reveals a day-count input for values like preset catalog rhythms (90, 180, 365) or any whole number from 1–365.

Use `Select` for common rhythms; custom input uses factual helper copy: "How often, in days? (1–365)".

---

### LifeAreaChip

**File:** `components/tend/life-area-chip.tsx`

```tsx
interface LifeAreaChipProps {
  area: LifeArea;
  selected?: boolean;
  onClick?: () => void;
}
```

Small pill: `text-xs`, `padding 6px 12px`, `radius-full`. Selected: `--tend-primary-muted` bg, `--tend-primary` text.

---

### LifeAreaFilter

**File:** `components/tend/life-area-filter.tsx`

```tsx
interface LifeAreaFilterProps {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
}
```

Collapsible row of `LifeAreaChip` + "All" chip, hidden by default. **Filter by area?** toggle (secondary `sm` button, muted text) expands the chip row via `.tend-collapsible-reveal`. When a life area is selected, the toggle shows `Filter by area · {label}` so the active filter stays visible while collapsed. Pass `defaultOpen` when the user needs the chips immediately (e.g. empty filter results).

**Stories:** 13

---

### PresetCard

**File:** `components/tend/preset-card.tsx`

```tsx
interface PresetCardProps {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  onSelect: () => void;
}
```

**Anatomy:** Tappable card. Name `text-base` medium. Metadata line: `{type} · every {n} days` in `text-sm` muted.

**Stories:** 4

---

### PresetSuggestions

**File:** `components/tend/preset-suggestions.tsx`

```tsx
interface PresetSuggestionsProps {
  onSelect: (preset: TendPreset) => void;
  selectedPresetName?: string;
  className?: string;
}
```

**Anatomy:** Collapsible panel on `/items/new`, hidden by default. **Need ideas?** sits in the page header action column (right). Panel sits above `ItemForm` with a short helper line, life-area filter pills, then suggestion chips.

**Visual hierarchy:** Life areas use filled `rounded-full` chips; suggestions use outlined `rounded-md` chips so the two rows read as filter vs. actions.

**Behavior:** Hidden until toggled with a subtle expand/collapse animation via `.tend-collapsible-reveal` (`--tend-duration-slow`, 320ms). Selecting a preset pre-fills the form below and focuses the name field.

**Stories:** 3 (add item), 4 (presets)

---

### ReminderBanner

**File:** `components/tend/reminder-banner.tsx`

```tsx
interface ReminderBannerProps {
  reminders: Array<{
    itemId: string;
    name: string;
    type: TendItemType;
    copy: string; // from domain reminder copy
  }>;
  onTend: (id: string) => void;
  onDismiss?: () => void;
}
```

**Styles:** `Alert` variant `reminder`. Soft stale background — not modal.

**Copy patterns (from Story 11):** Rotates daily among softened headlines (e.g. `"If you're up for it, why not tend to this:"`, `"A quiet moment this evening. Take a look at what needs attention:"`). Uses *this* vs *these* based on count. Names always appear in the list below, not in the headline.

Shows at most **3** reminders per visit. When more are eligible, a random subset is chosen on page load and re-shuffled when the eligible set changes (e.g. after tending).

Include inline `MarkTendedButton` size `sm` per item when multiple. Place the action in its own row below the item name, with the optional `TypeBadge` on the left and the button aligned right.

**Stories:** 11

---

### EmptyState

**File:** `components/tend/empty-state.tsx`

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

**Presets:**

| Key | Title | Description |
|-----|-------|-------------|
| `no-items` | "Nothing to tend yet" | "Add something you want to maintain — plants, sheets, a friendship." |
| `all-fresh` | "Nothing needs attention right now" | "Your rhythms are in good shape. Tend will let you know when something drifts." |
| `no-activity` | "No tending logged yet" | "When you mark items as tended, they'll show up here." |
| `no-availability` | "No availability set yet" | — |

**Styles:** Centered, `text-muted`, no illustration required for pre-alpha (optional `Leaf` icon 32px muted).

---

### ActivityListItem

**File:** `components/tend/activity-list-item.tsx`

```tsx
interface ActivityListItemProps {
  itemName: string;
  tendedAt: Date | string;
  onEdit?: () => void;
}
```

Simple row: name left, formatted date right, optional edit on hover.

**Stories:** 14

---

## Forms (composite)

### AuthForm

**File:** `components/forms/auth-form.tsx`

```tsx
interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthFormData) => Promise<void>;
}

interface AuthFormData {
  displayName?: string; // register only
  email: string;
  password: string;
}
```

Wraps `FormField` + `Input` / `PasswordInput` + `Button`. Register includes display name and confirm password fields with live password validation.

Pre-alpha footer note via `Alert` variant `info`.

**Stories:** 1

---

### ItemForm

**File:** `components/forms/item-form.tsx`

```tsx
interface ItemFormProps {
  initial?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string; // YYYY-MM-DD input value
}
```

Composes: name `Input`, `TypeSelector`, `RhythmSelect`, life area `Select`, last tended date `Input type="date"`.

Extract from current `onboarding-flow.tsx` `itemForm()` — that function is the behavioral reference.

**Stories:** 2, 3, 4, 8

---

### ItemDetailView

**File:** `components/tend/item-detail-view.tsx`

```tsx
interface ItemDetailViewProps {
  user: { displayName: string };
  initialItem: ItemResponse;
  initialEvents: TendEventResponse[];
  todayDate: string;
}
```

**Purpose:** Item detail screen with view/edit modes, mark tended action, and recent event history with correction.

**Stories:** 6, 7, 8, 14

---

### TendEventRow

**File:** `components/tend/tend-event-row.tsx`

```tsx
interface TendEventRowProps {
  event: TendEventResponse;
  onUpdate: (eventId: string, tendedAt: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}
```

**Purpose:** Single tend event row with inline date edit and remove actions.

**Stories:** 6, 14

---

### AvailabilityEditor

**File:** `components/forms/availability-editor.tsx`

```tsx
interface AvailabilityEditorProps {
  windows: AvailabilityWindow[];
  onChange: (windows: AvailabilityWindow[]) => void;
  onSave: () => Promise<void>;
}

interface AvailabilityWindow {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // "HH:MM"
  endTime: string;
}
```

**Anatomy:** 7 rows (Sun–Sat). Each row: day label + start/end time inputs (`type="time"`) + add/remove window.

Empty day: muted text "No windows set".

**Stories:** 10

---

### ConfirmDialog

**File:** `components/ui/dialog.tsx` (shadcn)

Used for archive and permanent delete.

```tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Copy:**
- Archive: "Archive {name}? It won't appear on your home screen but history stays saved."
- Delete: "Permanently delete {name}? This removes all tending history."

**Stories:** 9

---

## lib helpers

**File:** `lib/design/status-labels.ts`

```ts
import type { TendStatus, TendItemType, LifeArea } from "@tend/domain";

export const STATUS_LABELS: Record<TendStatus, string>;
export const TYPE_LABELS: Record<TendItemType, string>;
export const LIFE_AREA_LABELS: Record<LifeArea, string>;
// Re-export or align with @/lib/onboarding/constants
```

**File:** `lib/design/relative-time.ts`

```ts
export function formatRelativeTended(lastTendedAt: Date | null, now?: Date): string;
export function formatRhythm(days: number): string; // "Every 7 days"
```

---

## Migration from current code

| Current | Replace with |
|---------|--------------|
| `onboarding-flow.tsx` bare `<main>` | `OnboardingStep` + `ItemForm` + styled primitives |
| `login/page.tsx` inline form | `AuthForm` inside `Card` |
| `register/page.tsx` inline form | `AuthForm` |
| `page.tsx` placeholder home | `AttentionSection` + `TendItemCard` |
| `sign-out-button.tsx` | Keep; restyle with `Button` variant `ghost` |

---

## Example: Home page composition

```tsx
// app/page.tsx (target structure — illustrative)
<AppShell user={user}>
  <PageHeader
    title="Tend"
    subtitle={`Welcome back, ${user.displayName}`}
    action={<Button href="/items/new">Add item</Button>}
  />

  <AttentionSection title="Needs attention" count={groups.needsAttention.length}>
    {groups.needsAttention.map((item) => (
      <TendItemCard key={item.id} {...item} onTend={handleTend} />
    ))}
  </AttentionSection>

  <AttentionSection title="Getting stale" count={groups.gettingStale.length}>
    {groups.gettingStale.map((item) => (
      <TendItemCard key={item.id} {...item} onTend={handleTend} />
    ))}
  </AttentionSection>

  <AttentionSection title="Looking good" count={groups.lookingGood.length} defaultOpen={false}>
    {groups.lookingGood.map((item) => (
      <TendItemCard key={item.id} {...item} onTend={handleTend} />
    ))}
  </AttentionSection>

  {reminders.length > 0 && (
    <ReminderBanner reminders={reminders} onTend={handleTend} />
  )}

  <LifeAreaFilter selected={filter} onChange={setFilter} />
</AppShell>
```

Data from `groupForAttention()` in `@tend/domain` — already implemented.
