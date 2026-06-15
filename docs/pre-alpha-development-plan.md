# Tend Pre-Alpha Development Plan

> **Goal:** Ship a web-first pre-alpha that answers “What parts of my life could use attention now?” using local accounts, Postgres persistence, and gentle in-app reminders — without guilt-driven overdue UX.

**Architecture:** Bun monorepo with a shared domain package (status, rhythm, reminders), Drizzle + Postgres for data, and a Next.js web app exposing REST API routes. Business logic lives in `packages/domain` so it can be reused by a future Expo mobile app against the same API contracts.

**Tech stack:** Bun, TypeScript, Next.js 15 (App Router), React 19, PostgreSQL, Drizzle ORM, Zod, Tailwind CSS, shadcn/ui, Lucia (session auth), Biome (lint/format).

---

## Product decisions (resolve before build)

These close the open questions in `mvp-user-stories.md` for pre-alpha:

| Question | Pre-alpha decision | Rationale |
|----------|-------------------|-----------|
| Life areas | **Optional** — assignable on item, filter on home | Presets need areas; home works without them |
| Must reminder persistence | **Top of attention list + subtle badge** until tended; no modal spam | Strong enough for musts, not annoying |
| Want reminder range | **Derived** from rhythm + availability | Fewer settings during onboarding |
| Status labels | `Fresh` · `Getting stale` · `Needs attention` | Matches spec; copy can iterate |
| Tend history | **Multiple events** stored; UI shows recent + detail | Supports correction without analytics |
| Snooze | **Defer via availability only** in pre-alpha | Simpler; revisit if users ask |
| Presets at launch | **All six areas** (household, health, relationships, pets, vehicle, admin) | Low cost via seed data |
| Pause vs archive | **Archive + delete only** in pre-alpha | Avoids adding a second hidden-item state before users validate the need |

---

## Repository layout

```
tend/
├── apps/
│   └── web/                    # Next.js app (UI + /api/v1 REST)
├── packages/
│   ├── domain/                 # Pure TS: status, rhythm, reminders, presets
│   └── db/                     # Drizzle schema, migrations, query helpers
├── docker-compose.yml          # Local Postgres
├── docs/
│   ├── mvp-user-stories.md
│   ├── pre-alpha-development-plan.md
│   ├── design/                 # UI design system (see .cursor/rules/ui-design.mdc)
│   └── api/                    # HTTP endpoint docs (per .cursor/rules)
├── package.json                # Bun workspaces root
├── turbo.json
├── biome.json
└── README.md
```

---

## Technology choices

### Core

| Layer | Choice | Why |
|-------|--------|-----|
| Language | **TypeScript** (strict) | Shared types across web, API, and future mobile |
| Runtime / PM | **Bun** | Fast installs, native TS test runner, aligns with your preference |
| Web framework | **Next.js 15** (App Router) | Web-first MVP; API routes for REST; strong React ecosystem |
| UI | **React 19 + Tailwind 4 + shadcn/ui** | Fast, accessible components; easy to polish attention views |

**UI implementation:** Follow [`docs/design/`](design/README.md). Agents must reuse components in `apps/web/components/` per `.cursor/rules/ui-design.mdc` and the `implementation-workflow` checklist.
| Database | **PostgreSQL 16** | Your requirement; scales to production; great for relational tend data |
| ORM | **Drizzle** | Lightweight, SQL-friendly, excellent TS inference |
| Validation | **Zod** | Shared schemas for API bodies and forms |
| Auth (pre-alpha) | **Lucia + bcrypt** | Local email/password sessions; no OAuth/email-verify scope |
| Monorepo | **Bun workspaces + Turborepo** | Cache builds; clear package boundaries for mobile reuse |
| Lint / format | **Biome** | Single tool; matches project rules |

### Mobile path (post pre-alpha)

| Layer | Recommendation | Why |
|-------|----------------|-----|
| Mobile framework | **Expo (React Native)** | Same React/TS skills; OTA updates; push later |
| Shared code | `packages/domain` + OpenAPI/Zod contracts | Status math and API shapes stay identical |
| API | Keep **REST `/api/v1`** | Mobile client is a thin consumer; no GraphQL needed yet |
| Notifications | Expo Notifications → same reminder rules in `domain` | Reuse availability + status logic server-side |

### Explicitly not in pre-alpha

Cloud sync, email verification, password reset, native push, calendar integration, payments — per MVP scope.

---

## Data model

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| display_name | text | “What should we call you?” |
| email | text unique | Format validation only |
| password_hash | text | bcrypt |
| created_at | timestamptz | |

### `sessions`

Lucia-managed session table (id, user_id, expires_at).

### `tend_items`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| name | text | |
| type | enum `must` \| `want` | |
| rhythm_days | integer | e.g. 7, 14, 30, 90 |
| life_area | enum nullable | household, health, … |
| last_tended_at | timestamptz | Denormalized from latest event |
| archived_at | timestamptz nullable | Soft archive |
| created_at / updated_at | timestamptz | |

`status` is intentionally not stored. It is computed from `last_tended_at`, `rhythm_days`, and the current time by `packages/domain` whenever items are read or reminders are generated. This avoids persisted status drifting out of sync with the actual tending history.

### `tend_events`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| item_id | uuid FK | |
| tended_at | timestamptz | User-adjustable |
| created_at | timestamptz | |

### `availability_windows`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| day_of_week | smallint | 0=Sunday … 6=Saturday |
| start_time | time | Local wall clock |
| end_time | time | |

### `user_settings` (optional row per user)

| Column | Type | Notes |
|--------|------|-------|
| onboarding_completed_at | timestamptz nullable | |
| timezone | text | Default `Intl` or explicit picker later |

---

## Domain logic (`packages/domain`)

Implement as pure functions with unit tests — no DB imports. Domain logic comes before auth on purpose: status, sorting, reminders, and presets are product rules that do not depend on users, sessions, or persistence. Auth can then wrap those rules without changing them.

### Status derivation

```
daysSince = floor(now - last_tended_at)

if daysSince <= rhythm_days * 0.5     → Fresh
if daysSince <= rhythm_days * 1.0     → Getting stale
else                                   → Needs attention
```

- **Wants** never use “overdue” language in UI; same thresholds, softer copy.
- **Musts** sort above wants when both need attention.

### Attention ordering

1. `needs_attention` musts (oldest `last_tended_at` first)
2. `needs_attention` wants
3. `getting_stale` musts
4. `getting_stale` wants
5. `fresh` items (collapsed or secondary section)

### Reminder surfacing (in-app)

- Poll or compute on page load / interval while app is open.
- Item qualifies when its computed status is `getting_stale` or `needs_attention`.
- If user has availability windows: prefer surfacing during current window; otherwise next window.
- Copy examples from user stories — awareness, not guilt.

### Presets

Static catalog in `packages/domain/presets.ts` with `name`, `type`, `rhythm_days`, `life_area`.

---

## API surface (`/api/v1`)

Document each endpoint in `docs/api/` as implemented.

| Method | Path | Stories |
|--------|------|---------|
| POST | `/auth/register` | 1 |
| POST | `/auth/login` | 1 |
| POST | `/auth/logout` | 1 |
| GET | `/me` | 1 |
| GET/PUT | `/onboarding` | 2 |
| GET/POST | `/items` | 3, 5 |
| GET/PATCH/DELETE | `/items/:id` | 6, 8, 9 |
| POST | `/items/:id/tend` | 7 |
| GET | `/items/presets` | 4 |
| GET/PUT | `/availability` | 10 |
| GET | `/reminders` | 11, 12, 13 |
| GET | `/activity` | 14 |
| GET | `/activity` | 14 |
| PATCH/DELETE | `/activity/:eventId` | 14 |

All routes require session except register/login.

---

## Implementation phases

### Phase 0 — Foundation (week 1)

**Deliverable:** Empty app runs; DB migrates; CI lint passes.

- [x] Initialize Bun monorepo (`apps/web`, `packages/domain`, `packages/db`)
- [x] Add Docker Compose Postgres + `.env.example`
- [x] Drizzle schema + initial migration
- [x] Biome + Turborepo scripts (`lint`, `test`, `dev`, `db:migrate`)
- [x] Next.js shell with health check route `GET /api/v1/health`
- [x] GitHub Actions or local script: lint + test on push

**Exit criteria:** `bun run dev` serves web; `bun run db:migrate` applies schema.

---

### Phase 1 — Domain core (week 1)

**Deliverable:** Tested status, sorting, and reminder eligibility.

- [x] `computeStatus(item, now)` with edge cases (null last tended → treat as needs attention or prompt)
- [x] `sortForAttention(items[])`
- [x] `eligibleReminders(items[], availability[], now)`
- [x] Preset catalog
- [x] ≥1 unit test per meaningful branch (per testing rule)

**Maps to:** Stories 5, 11, 12, 13 (logic only).

---

### Phase 2 — Local auth (week 2)

**Deliverable:** Register, login, persistent session, protected routes.

- [x] Lucia setup + session cookie
- [x] Register/login/logout/me endpoints
- [x] Zod validation (name, email format, password min length)
- [x] Middleware: redirect unauthenticated users to `/login`
- [x] Integration tests for auth flow

**Maps to:** Story 1.

---

### Phase 3 — Tend items CRUD (week 2–3)

**Deliverable:** Create, read, update, archive, delete items; tend events.

- [x] POST/GET items with computed status on read
- [x] PATCH item (name, type, rhythm, life_area, last_tended_at)
- [x] POST tend → append event, update `last_tended_at`, and return computed status
- [x] Archive + hard delete with confirmation flag
- [x] API docs in `docs/api/items.md`

**Maps to:** Stories 3, 6, 7, 8, 9.

---

### Phase 4 — Onboarding & presets (week 3)

**Deliverable:** First-run flow; quick add from suggestions.

- [x] Onboarding pages: concept explainer → optional first item → skip to home
- [x] Preset picker by life area
- [x] Edit type/rhythm/last tended before save
- [x] Mark `onboarding_completed_at`

**Maps to:** Stories 2, 4, 13 (optional life area on create).

---

### Phase 5 — Home & attention UI (week 3–4)

**Deliverable:** Main screen answers “what needs attention?”

- [x] Attention hero (most important stale item)
- [x] Sections: Needs attention / Getting stale / Looking good
- [x] Relative time copy (“11 days ago”) — no “overdue” for wants
- [x] Must vs want visual distinction
- [x] Quick “Mark tended” from list
- [x] Life area filter (optional chips)

**Maps to:** Stories 5, 12, 13.

---

### Phase 6 — Item detail & history (week 4)

**Deliverable:** Detail screen with edit and recent events.

- [x] Detail view: name, type, rhythm, status, last tended
- [x] Recent tend events list
- [x] Edit item form
- [x] Correct tended date (PATCH event or re-tend)

**Maps to:** Stories 6, 7, 8, 14.

---

### Phase 7 — Availability & in-app reminders (week 4–5)

**Deliverable:** Weekly windows + gentle reminder banner/panel.

- [x] Availability editor (per-day windows, optional empty days)
- [x] GET `/reminders` using domain eligibility
- [x] In-app reminder surface (banner or slide-over)
- [x] Mark tended from reminder UI
- [x] API docs `docs/api/reminders.md`, `docs/api/availability.md`

**Maps to:** Stories 10, 11, 12.

---

### Phase 8 — Polish & pre-alpha ship (week 5)

**Deliverable:** Usable by a handful of testers locally.

- [x] Empty states (no items, no availability, all fresh)
- [x] Error states and form validation messages
- [x] Recent activity page
- [x] README setup verified on clean machine
- [x] Manual test script against all 14 stories
- [x] `graphify update .` after codebase exists

**Maps to:** Story 14; overall MVP cut.

---

## UI routes (web)

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Auth |
| `/onboarding` | First-time setup |
| `/` | Home / attention view |
| `/items/new` | Quick add |
| `/items/[id]` | Detail + edit |
| `/presets` | Browse/add presets (or modal from home) |
| `/settings/availability` | Weekly windows |
| `/activity` | Recent tending history |

---

## Testing strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Domain unit | `bun test` | Status thresholds, sort order, reminder windows |
| API integration | `bun test` + test DB | Auth, CRUD, tend flow |
| UI | Manual pre-alpha; Playwright later | Critical paths after UI stabilizes |

Minimum bar per project rules: every new branch in domain/handlers gets unit tests; HTTP handlers get integration tests.

---

## Environment variables

See `.env.example` in repo root. Required for local dev:

- `DATABASE_URL`
- `SESSION_SECRET` (32+ random bytes)

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Scope creep (analytics, sync, push) | Stick to “Suggested MVP Cut” in user stories |
| Status copy feels punitive | User-test labels; wants use age-based copy only |
| Monorepo overhead early | Only 2 packages + 1 app; add more when mobile starts |
| Local-only auth confusion | Clear UI copy: no cloud sync / password reset in pre-alpha |

---

## Definition of done (pre-alpha)

- [x] All items in **Suggested MVP Cut** (`mvp-user-stories.md`) implemented
- [x] Stories 13–14 implemented at MVP level (filter + simple activity list)
- [x] Lint passes on changed files
- [x] Domain + API tests pass
- [x] `docs/api/` updated for all endpoints
- [x] README documents local setup end-to-end
- [x] No production auth, push, or calendar features shipped

---

## After pre-alpha

1. Dogfood for 2–4 weeks; tune status thresholds and copy.
2. Add Expo app consuming `/api/v1` (shared `packages/domain` types).
3. Hosted Postgres + proper auth (email verify, reset) when moving beyond local-only.
4. Push notifications using same reminder engine.
