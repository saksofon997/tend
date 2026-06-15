# Tend Alpha Development Plan (Phases 1–4)

> **Goal:** Ship the first four alpha phases — public shell, account deletion, expanded suggested tends, and English/Serbian i18n — so unauthenticated visitors can learn what Tend is, signed-in users can leave cleanly, onboarding offers a rich preset catalog, and Serbian testers can use core flows in their language.

**Starting point:** Pre-alpha is complete. See [`pre-alpha-development-plan.md`](./pre-alpha-development-plan.md).

**Roadmap context:** Phases 5 (email) and 6 (Google signup) remain in [`alpha-roadmap.md`](./alpha-roadmap.md). This plan covers Phases 1–4.

**Architecture unchanged:** Bun monorepo, `packages/domain` for business logic, Next.js web app + REST `/api/v1`, Drizzle + Postgres, Lucia session auth.

**Tech additions (Phase 4):** [`next-intl`](https://next-intl.dev/) for App Router i18n with locale-prefixed routes (`/en/...`, `/sr/...`).

---

## Product decisions (resolve before Phase 1)

| Question | Recommended alpha decision | Rationale |
|----------|---------------------------|-----------|
| Landing URL | **`/`** for visitors; signed-in users redirect to home view | Single canonical entry; matches common SaaS pattern |
| Invite list | **Keep `ALLOWED_EMAILS`** until Serbian cohort is ready | Closed alpha; drop in Phase 4/5 if opening publicly |
| Legal pages | **Sample Markdown + disclaimer** | Sufficient for small alpha; not counsel-reviewed |
| Locale URL strategy | **Prefix** (`/en/login`, `/sr/login`) | Shareable links; SEO-friendly for landing |
| Deletion confirm (Phase 2) | **Type `DELETE` + password re-entry** | No email provider yet; email confirm deferred to Phase 5 |
| i18n scope for ship | **P0 + P1 complete; P2 landing/legal best-effort; P3 presets** | Core app + catalog usable in Serbian |
| Preset catalog | **10–12 life areas, 6–8 presets each, stable `key` per preset** | Lock before i18n; see Phase 3 open questions |
| New life areas | **4–6 new enums** from roadmap candidates | Requires migration; finalize in Iteration 3.1 |

---

## Current state (pre-alpha gaps)

| Area | Today | Alpha target |
|------|-------|--------------|
| `/` | Redirects unauthenticated users to `/login` | Public landing for visitors; home for signed-in users |
| Legal | None | `/privacy`, `/terms` sample pages |
| Footer | None on auth or app shell | Privacy · Terms · Language |
| Account deletion | `deleteUserByEmail` in test helpers only | User-initiated hard delete via API + settings UI |
| Presets | 6 areas, ~22 suggested tends in `packages/domain/src/presets.ts` | 10–12 areas, ~70–90 tends; stable keys for i18n |
| i18n | Hardcoded English; `en-US` in `relative-time.ts` | `next-intl` with `en` + `sr`; locale on `user_settings` |
| Middleware | Public: login, register, health, auth API | Also public: `/`, `/privacy`, `/terms`; locale-aware paths |

---

## Implementation phases

Phases map to [`alpha-roadmap.md`](./alpha-roadmap.md) Phases 1–4. Each iteration has a **deliverable**, **tasks**, and **exit criteria** you can verify with automated tests or a short manual script.

---

### Phase 1 — Public shell (landing + legal samples)

**Theme:** Anyone can learn what Tend is before signing up.

**Rough effort:** ~1 week (4 iterations)

---

#### Iteration 1.1 — Route split & public middleware

**Deliverable:** Unauthenticated visitors reach public pages; signed-in users reach the app home.

**Tasks**

- [ ] Extend `PUBLIC_PATHS` in `apps/web/middleware.ts`: `/`, `/privacy`, `/terms` (and locale-prefixed variants once Phase 4 lands — stub paths now or add in 4.1)
- [ ] Refactor `apps/web/app/page.tsx`: no session → render landing (placeholder OK until 1.2); session + onboarding incomplete → `/onboarding`; session + onboarded → `HomeView`
- [ ] Redirect signed-in users away from `/login` and `/register` to `/` (optional polish)

**Exit criteria**

- [ ] `curl -I /` without session cookie → `200` (not redirect to login)
- [ ] Authenticated request to `/` → home content (integration test or manual)
- [ ] Protected routes (`/items/new`, `/activity`) still redirect to login when unauthenticated
- [ ] `bun run lint` passes on changed files

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | Unauthenticated `GET /` returns 200; unauthenticated `GET /activity` redirects to login |
| Manual | Incognito `/` loads; signed-in `/` shows home |

---

#### Iteration 1.2 — Landing page

**Deliverable:** Marketing-lite landing with value prop and CTAs.

**Tasks**

- [ ] Create `apps/web/components/marketing/landing-page.tsx` (or `app/(public)/welcome` if using route groups)
- [ ] Content: what Tend is, how it differs (no guilt/overdue UX), Register + Sign in CTAs
- [ ] Reuse design tokens from [`docs/design/`](design/README.md); follow `AuthLayout` spacing/typography patterns
- [ ] Run impeccable `adapt` + `polish` on finished UI

**Exit criteria**

- [ ] Landing renders at `/` for unauthenticated visitors
- [ ] Register and Sign in links navigate to `/register` and `/login`
- [ ] Page passes basic accessibility check (heading hierarchy, link labels, contrast via design tokens)
- [ ] No new linter errors

**Tests**

| Type | What to verify |
|------|----------------|
| Manual | One-scroll comprehension: value prop + CTAs visible without scrolling on desktop |
| Manual | Mobile viewport: CTAs reachable; no horizontal overflow |

---

#### Iteration 1.3 — Sample legal pages

**Deliverable:** Privacy and Terms pages with alpha-appropriate disclaimers.

**Tasks**

- [ ] Add Markdown source: `apps/web/content/legal/privacy.md`, `terms.md`
- [ ] Minimum content per roadmap: data stored, no selling PII, hosting providers, contact email, **sample document disclaimer**
- [ ] Routes: `/privacy`, `/terms` — render MD to page (shared `LegalPage` layout)
- [ ] Add routes to public middleware list

**Exit criteria**

- [ ] Both pages return 200 without auth
- [ ] Disclaimer visible above the fold or in page header
- [ ] Contact email and data inventory sections present

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | `GET /privacy` and `GET /terms` → 200, contain disclaimer string |
| Manual | Read-through: covers email, items, events, availability; mentions Vercel/Neon (or actual hosts) |

---

#### Iteration 1.4 — Site footer

**Deliverable:** Footer on auth surfaces and app shell with legal links.

**Tasks**

- [ ] Create `apps/web/components/layout/site-footer.tsx`: Privacy · Terms · Language (Language disabled or “Coming soon” until Phase 4.5)
- [ ] Wire into `AuthLayout` and `AppShell`
- [ ] Update `AuthLayout` logo link: unauthenticated → `/`; authenticated → `/` (home)

**Exit criteria**

- [ ] Footer visible on `/login`, `/register`, `/`, and app pages using `AppShell`
- [ ] Privacy and Terms links resolve correctly
- [ ] impeccable polish pass on footer spacing and copy

**Tests**

| Type | What to verify |
|------|----------------|
| Manual | Footer on login, register, home, availability settings |
| Manual | Privacy/Terms links open correct pages |

---

#### Phase 1 definition of done

- [ ] All four iterations complete
- [ ] Landing explains product in one scroll
- [ ] Sample Privacy + Terms published and linked from auth + app surfaces
- [ ] Route split: visitors → landing; signed-in → home
- [ ] Lint passes; no regressions in existing auth/item integration tests

---

### Phase 2 — Account deletion

**Theme:** Users can permanently delete their account and all associated data.

**Rough effort:** 3–5 days (3 iterations)

**Prerequisite:** Phase 1 footer/legal ship (Privacy policy promises deletion).

---

#### Iteration 2.1 — Deletion data layer

**Deliverable:** Production-ready delete helper with cascade verification.

**Tasks**

- [ ] Add `deleteUserById(database, userId)` in `packages/db` (promote pattern from `deleteUserByEmail` in test helpers)
- [ ] Add `verifyUserPassword(database, userId, password)` or reuse existing auth verify
- [ ] Keep `deleteUserByEmail` in test helpers delegating to `deleteUserById` (or thin wrapper) to avoid drift
- [ ] Document cascade behavior: `users` → `sessions`, `user_settings`, `tend_items`, `tend_events`, `availability_windows`

**Exit criteria**

- [ ] Integration test: create user → add items + events + availability + settings → delete by id → assert zero rows for that user across all tables
- [ ] Integration test: delete non-existent user id → no throw / appropriate handling

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | Full cascade test in `packages/db` or `apps/web/lib/account/` |
| Integration | Sessions for deleted user no longer validate |

---

#### Iteration 2.2 — Account deletion API

**Deliverable:** `DELETE /api/v1/account` with confirmation and session invalidation.

**Tasks**

- [ ] Route: `apps/web/app/api/v1/account/route.ts`
- [ ] Request body (Zod): `{ confirmation: "DELETE", password: string }` — password required for password-based users
- [ ] Handler: verify session → verify password → delete user → invalidate session cookie
- [ ] Responses: `204` success; `400` validation; `401` bad password / no session; `403` if confirmation wrong
- [ ] API docs: `docs/api/account.md`; update `docs/api/README.md`

**Exit criteria**

- [ ] Integration test: register → create items → DELETE account → subsequent `/api/v1/auth/me` returns 401
- [ ] Integration test: wrong password → 401; wrong confirmation → 400
- [ ] Lint passes; API docs match handler behavior

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | Happy path delete + data gone |
| Integration | Wrong password rejected |
| Integration | Unauthenticated → 401 |

---

#### Iteration 2.3 — Account settings UI

**Deliverable:** Settings page with destructive delete flow.

**Tasks**

- [ ] Route: `/settings/account` (add nav entry in `AppShell` — Settings section or sub-nav)
- [ ] Page: explain what deletion removes; confirmation form (type `DELETE` + password)
- [ ] Client calls `DELETE /api/v1/account`; on success redirect to `/` (landing) with session cleared
- [ ] Error states: wrong password, network failure — gentle copy, no alarm styling

**Exit criteria**

- [ ] Manual script (below) passes end-to-end
- [ ] Delete button disabled until confirmation field matches `DELETE`
- [ ] impeccable `adapt` + `polish` on settings page

**Tests**

| Type | What to verify |
|------|----------------|
| Manual | Register → add item → delete account → cannot log in → item gone from DB |
| Manual | Wrong password shows inline error; account still exists |
| Integration | Optional: Playwright or API-only path covered by 2.2 tests |

**Manual test script (Phase 2)**

1. Register user `delete-test@example.com` with password.
2. Complete onboarding; create one tend item.
3. Open `/settings/account`; enter wrong password → see error.
4. Enter `DELETE` + correct password → redirected to landing; session cookie cleared.
5. Attempt login → succeeds only if user re-registers (original account gone).
6. DB check (optional): no rows for that user id.

---

#### Phase 2 definition of done

- [ ] All three iterations complete
- [ ] `DELETE /api/v1/account` documented and tested
- [ ] User-initiated hard delete with password + `DELETE` confirmation
- [ ] Immediate session invalidation after delete
- [ ] Cascade verified by integration test
- [ ] Email confirmation deferred to Phase 5 (documented in API doc)

---

### Phase 3 — Expanded preset catalog

**Theme:** Onboarding and quick-add offer enough suggested tends across meaningful life areas that alpha testers rarely hit a dead-end picker.

**Rough effort:** 3–5 days (4 iterations)

**Prerequisite:** None hard — can start in parallel with late Phase 2. **Must complete before Phase 4 i18n P3** (preset translation).

**Current baseline:** `packages/domain/src/presets.ts` — household, health, relationships, pets, vehicle, admin (~3–4 presets each). `personal` has no presets. UI: `PresetSuggestions`, onboarding preset step, `LifeAreaFilter` chips.

---

#### Iteration 3.1 — Catalog spec & stable keys

**Deliverable:** Signed-off preset list with stable identifiers for i18n.

**Tasks**

- [ ] Draft catalog spreadsheet or Markdown: life area → preset key → display name → type → rhythm days → optional description
- [ ] Assign stable keys: `{area}.{slug}` (e.g. `household.change-bed-sheets`)
- [ ] Product review: must/want balance, rhythm sanity, no guilt-driven naming
- [ ] Decide final new life areas (4–6) from roadmap candidates; confirm labels

**Exit criteria**

- [ ] Catalog document checked in under `docs/` (e.g. `docs/preset-catalog.md`) or linked issue
- [ ] Every preset has unique key, name, type, rhythm ≥ 1
- [ ] Target met: 10–12 areas, 6–8 presets per area (~70–90 total)

**Tests**

| Type | What to verify |
|------|----------------|
| Review | No duplicate keys; every area non-empty except `personal` |
| Review | Must items are sparse per design language |

---

#### Iteration 3.2 — Domain types & DB migration

**Deliverable:** Schema supports new life areas; preset type includes `key`.

**Tasks**

- [ ] Extend `LifeArea` in `packages/domain/src/types.ts`
- [ ] Add Drizzle migration: `ALTER TYPE life_area ADD VALUE ...` for each new area
- [ ] Extend `TendPreset` with `key: string`; optional `description?: string`
- [ ] Update `LIFE_AREA_ORDER` and `LIFE_AREA_LABELS` in `apps/web/lib/onboarding/constants.ts` and `status-labels.ts` (consolidate duplicates if practical)

**Exit criteria**

- [ ] `bun run db:migrate` applies on clean and existing DBs
- [ ] TypeScript compiles; existing items with old areas unaffected
- [ ] Domain tests updated for new area count

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | Migration applies; insert item with new `life_area` succeeds |
| Unit | `LifeArea` type matches enum values |

---

#### Iteration 3.3 — Preset content & domain tests

**Deliverable:** Full catalog in `presets.ts`; tests guard quality.

**Tasks**

- [ ] Implement all presets from catalog spec in `packages/domain/src/presets.ts`
- [ ] Expand existing six areas + add new area arrays
- [ ] Export helper: `getPresetByKey(key)` (optional, for i18n/tests)
- [ ] Update `packages/domain/tests/presets.test.ts`: area count, min presets per area, unique keys, valid type/rhythm

**Exit criteria**

- [ ] `ALL_PRESETS.length` ≥ 70 (or agreed target from 3.1)
- [ ] `bun test` in `packages/domain` passes
- [ ] No duplicate preset keys

**Tests**

| Type | What to verify |
|------|----------------|
| Unit | Each area in `PRESETS_BY_AREA` has ≥ 6 presets |
| Unit | All keys unique; rhythms > 0; types valid |
| Unit | `getPresetsByArea("personal")` returns `[]` |

---

#### Iteration 3.4 — API & UI surfacing

**Deliverable:** Expanded catalog visible in onboarding, add-item, and API.

**Tasks**

- [ ] Update `GET /api/v1/items/presets` response to include `key` (and `description` if added)
- [ ] Verify `PresetSuggestions` and onboarding preset step render all areas (chip wrap/scroll if needed)
- [ ] Update `docs/api/items.md` preset response shape
- [ ] impeccable polish if chip row feels crowded (two-row scroll, area grouping)

**Exit criteria**

- [ ] API returns full expanded catalog
- [ ] Manual script (below) passes
- [ ] Lint passes

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | `GET /api/v1/items/presets` returns ≥ 70 presets with keys |
| Manual | Onboarding: browse each new area; select preset; item created with defaults |
| Manual | Add item: switch areas; presets update; pre-fill works |

**Manual test script (Phase 3)**

1. Register fresh user; reach onboarding preset step.
2. For each new life area chip: select area → see ≥ 6 presets.
3. Pick one preset → confirm name, type, rhythm pre-filled → save item.
4. `/items/new`: repeat for two additional areas.
5. Home life-area filter includes new areas.

---

#### Phase 3 definition of done

- [ ] All four iterations complete
- [ ] 10–12 life areas with 6–8 presets each in domain + API
- [ ] Stable preset keys ready for Phase 4 translation
- [ ] Migration applied; domain tests pass
- [ ] Onboarding and add-item flows show expanded catalog

---

### Phase 4 — i18n (English + Serbian)

**Theme:** Core product usable in English and Serbian; shareable locale-prefixed URLs.

**Rough effort:** 1–2 weeks (7 iterations)

**Prerequisite:** Phase 1 strings exist to extract (landing/legal in P2). Phase 3 catalog locked (preset keys for P3 translation).

---

#### Iteration 4.1 — i18n infrastructure

**Deliverable:** Locale routing, middleware, and message file scaffold.

**Tasks**

- [ ] Install and configure `next-intl` for App Router
- [ ] Locales: `en` (default), `sr`
- [ ] Route structure: `/[locale]/...` with middleware redirect from `/login` → `/en/login` (or browser `Accept-Language` negotiation)
- [ ] Create `apps/web/messages/en.json`, `messages/sr.json` (start with a few keys to prove wiring)
- [ ] Add `locale` column to `user_settings` (migration); default `en`
- [ ] CI script: fail build if translation keys missing between `en.json` and `sr.json` (e.g. small Bun script in `apps/web/scripts/check-i18n.ts`)

**Exit criteria**

- [ ] `/en/login` and `/sr/login` render (Serbian may show English fallback until 4.2)
- [ ] Middleware sets locale; public paths from Phase 1 work under locale prefix
- [ ] `bun run check-i18n` (or equivalent) passes in CI
- [ ] Migration applies cleanly

**Tests**

| Type | What to verify |
|------|----------------|
| Unit/script | Key parity check fails when `sr.json` missing a key from `en.json` |
| Integration | Request to `/sr/login` → 200 with locale context |
| Manual | Browser `Accept-Language: sr` redirects to `/sr/...` on first visit |

---

#### Iteration 4.2 — P0 translations (auth, onboarding, home, status)

**Deliverable:** Core signed-in and auth flows fully translated.

**Tasks**

- [ ] Extract strings from: login, register, onboarding, `HomeView`, status labels (`Fresh`, `Getting stale`, `Needs attention`), reminder surfaces
- [ ] Serbian copy: product owner review — avoid punitive tone (see [`design-language.md`](design/design-language.md))
- [ ] Domain rule unchanged: status *logic* in `packages/domain`; only UI labels translated
- [ ] Wire `useTranslations` / server helpers in all P0 components

**Exit criteria**

- [ ] Manual smoke script passes in both locales (partial — presets completed in 4.5)
- [ ] No hardcoded English in P0 components (grep check)
- [ ] `check-i18n` passes

**Tests**

| Type | What to verify |
|------|----------------|
| Manual smoke | `/en`: register → onboard → home → see status sections in English |
| Manual smoke | `/sr`: same flow; status labels and nav in Serbian |
| Script | `check-i18n` green |

---

#### Iteration 4.3 — P1 translations (forms, settings, errors)

**Deliverable:** Item forms, settings pages, validation messages translated.

**Tasks**

- [ ] Extract: add/edit item forms, availability editor, account deletion page (Phase 2), API error messages surfaced in UI
- [ ] Serbian pass for P1 keys
- [ ] Zod validation messages via i18n keys where shown to users

**Exit criteria**

- [ ] Create item flow works in `/sr/items/new` with Serbian labels
- [ ] Availability settings and account deletion UI in Serbian
- [ ] Form validation errors display in active locale

**Tests**

| Type | What to verify |
|------|----------------|
| Manual | Add item in Serbian locale; validation error on empty name → Serbian message |
| Manual | Delete account confirmation strings in Serbian |
| Script | `check-i18n` passes |

---

#### Iteration 4.4 — P2 translations (landing, legal)

**Deliverable:** Public/marketing surfaces translated.

**Tasks**

- [ ] Landing page strings to message files (or locale-specific MD for legal)
- [ ] Privacy + Terms: either translated Markdown (`privacy.en.md` / `privacy.sr.md`) or JSON sections
- [ ] Footer link labels

**Exit criteria**

- [ ] `/sr/` landing readable in Serbian
- [ ] `/sr/privacy` and `/sr/terms` available (Serbian legal copy flagged as sample)

**Tests**

| Type | What to verify |
|------|----------------|
| Manual | Serbian landing + legal pages render without English fallbacks in body copy |
| Script | `check-i18n` passes |

---

#### Iteration 4.5 — P3 translations (life areas + presets)

**Deliverable:** Life-area labels and all preset display names (and descriptions) translated via stable keys from Phase 3.

**Tasks**

- [ ] Message namespace: `lifeAreas.*`, `presets.{key}.name`, optional `presets.{key}.description`
- [ ] Generate or maintain preset keys from `ALL_PRESETS` (script to diff catalog vs message file)
- [ ] Serbian pass for all life areas and ~70–90 preset names; owner review for gentle tone
- [ ] Update `PresetSuggestions`, onboarding, filters, item form to resolve display names through i18n

**Exit criteria**

- [ ] Every preset key in domain has `presets.{key}.name` in both `en.json` and `sr.json`
- [ ] Life-area chip labels translated in both locales
- [ ] `check-i18n` passes including preset key coverage script

**Tests**

| Type | What to verify |
|------|----------------|
| Script | Preset key coverage: no domain preset missing from message files |
| Manual | `/sr/items/new`: browse two areas; preset names in Serbian |
| Manual | Onboarding preset step shows Serbian names |

---

#### Iteration 4.6 — Language switcher & user preference

**Deliverable:** Footer language control; persisted locale preference.

**Tasks**

- [ ] Enable footer Language control: switch between `en` and `sr` (updates URL prefix)
- [ ] Settings: optional locale override stored on `user_settings.locale`
- [ ] API: extend settings PATCH (or add) to persist locale; login session uses stored locale over browser default when set
- [ ] Redirect after switch preserves path (`/en/settings/account` → `/sr/settings/account`)

**Exit criteria**

- [ ] Switching language on landing updates URL and content
- [ ] Logged-in user preference survives reload and next login
- [ ] API integration test for locale persistence (if settings endpoint extended)

**Tests**

| Type | What to verify |
|------|----------------|
| Integration | PATCH settings with `locale: "sr"` → subsequent page load uses Serbian |
| Manual | Footer switcher on login and home pages |

---

#### Iteration 4.7 — Locale-aware formatting

**Deliverable:** Dates and relative time respect active locale.

**Tasks**

- [ ] Update `apps/web/lib/design/relative-time.ts`: accept locale param; use `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat` instead of hardcoded `en-US`
- [ ] Pass active locale from `next-intl` at call sites
- [ ] Extend `relative-time.test.ts` with `en` and `sr` cases

**Exit criteria**

- [ ] `formatEventDate` respects locale (month names differ for `sr`)
- [ ] Relative tended copy works for both locales
- [ ] Existing tests updated; new locale cases pass

**Tests**

| Type | What to verify |
|------|----------------|
| Unit | `relative-time.test.ts` covers en + sr formatting |
| Manual | Activity page dates differ appropriately between `/en/activity` and `/sr/activity` |

---

#### Phase 4 definition of done

- [ ] All seven iterations complete
- [ ] `messages/en.json` and `messages/sr.json` complete for P0 + P1 + P3 presets; P2 landing/legal present
- [ ] CI fails on missing translation keys (including preset keys)
- [ ] Locale prefix routing works for all app routes
- [ ] User locale preference stored and honored
- [ ] Serbian status and preset copy reviewed for gentle tone
- [ ] Lint + full test suite pass

**Manual smoke script (Phase 4 — run in both locales)**

1. Open `/sr/login` → UI in Serbian.
2. Register (if allowed) → onboarding in Serbian; preset names in Serbian.
3. Home: section headers and status labels in Serbian.
4. Add item → form labels, life areas, and preset suggestions in Serbian.
5. Settings → availability + account pages in Serbian.
6. Switch to English via footer → URL becomes `/en/...`; content updates.
7. Log out; revisit `/sr/` landing → Serbian public copy.

---

## UI routes (Phases 1–4 additions)

| Route | Phase | Purpose |
|-------|-------|---------|
| `/` | 1 | Public landing (unauthenticated) or home (authenticated) |
| `/privacy`, `/terms` | 1 | Sample legal pages |
| `/settings/account` | 2 | Account deletion |
| `/[locale]/...` | 4 | Locale-prefixed app routes (e.g. `/en/login`, `/sr/items/new`) |

Existing pre-alpha routes move under locale prefix in Phase 4. Phase 5 adds `/forgot-password`, `/reset-password`; Phase 6 adds OAuth callbacks.

---

## API surface (Phases 1–4 additions)

| Method | Path | Phase | Auth |
|--------|------|-------|------|
| DELETE | `/api/v1/account` | 2 | Session + password confirm |

`GET /api/v1/items/presets` response gains `key` (Phase 3). Settings locale persistence reuses or extends existing user settings endpoints (document in `docs/api/` when implemented).

---

## Testing strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Domain unit | `bun test` | Preset catalog quality; no i18n in domain |
| API integration | `bun test` + test DB | Account deletion cascade; presets API shape |
| i18n | `check-i18n` + preset key script + manual smoke | Key parity; preset coverage; both locales |
| UI | Manual + impeccable review | Landing, legal, deletion UX, preset picker, locale switcher |
| Middleware | Integration tests | Public vs protected paths; locale redirects |

**Commands (after implementation)**

```bash
bun run lint
bun run test
bun run check-i18n   # add to package.json in Iteration 4.1
```

Minimum bar per project rules: every new API handler gets integration tests; deletion cascade gets explicit coverage; preset catalog guarded by domain tests; i18n key parity enforced in CI.

---

## Parallel work

While Phase 1 ships English-only:

- Product owner drafts Serbian P0/P1 strings in a spreadsheet or draft `sr.json` (status labels first).
- Legal sample copy can be reviewed for GDPR completeness before Phase 2 deletion ships.
- **Draft expanded preset catalog** (Phase 3.1) — names, areas, rhythms — in parallel with Phase 1–2.

While Phase 2 ships:

- Phase 3.2–3.3 (migration + preset content) can proceed independently of i18n.

While Phase 3 ships:

- Phase 4.1 i18n infrastructure can start; preset translation (4.5) waits for catalog lock.

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Locale prefix breaks existing bookmarks | Middleware redirect from unprefixed paths to default locale |
| Route split confuses `/` vs home | Clear redirect rules; signed-in always see home at `/` or `/en/` |
| Serbian copy feels punitive | Owner review against design language; avoid “overdue” equivalents |
| Preset picker overcrowded | Chip wrap/scroll; 6–8 presets per area max; area filter first |
| Enum migration on production DB | Test `ADD VALUE` migration on Neon staging; deploy before preset UI ship |
| Large i18n surface (~90 preset names) | Stable keys + coverage script; translate in dedicated iteration 4.5 |
| Deletion without email confirm | Document alpha limitation; add email confirm in Phase 5 |
| `next-intl` + App Router complexity | Follow official App Router guide; one iteration for infra only |

---

## Definition of done (Phases 1–4)

- [ ] Phase 1: Landing, Privacy, Terms, footer, route split — all iterations complete
- [ ] Phase 2: Account deletion API + UI + cascade tests — all iterations complete
- [ ] Phase 3: Expanded preset catalog in domain, API, onboarding, add-item — all iterations complete
- [ ] Phase 4: `en` + `sr` for P0/P1/P3; P2 landing/legal; locale routing + preference + formatting — all iterations complete
- [ ] `docs/api/account.md` published; preset response documented in `docs/api/items.md`
- [ ] Lint passes on changed files
- [ ] Domain + API tests pass
- [ ] Manual smoke scripts for Phases 2, 3, and 4 executed once
- [ ] `graphify update .` after codebase changes

---

## What comes next

Phases 5–6 from [`alpha-roadmap.md`](./alpha-roadmap.md):

1. **Email** — transactional provider, password reset, optional deletion confirmation email
2. **Google signup** — OAuth schema, Arctic/Lucia integration, account linking

See alpha roadmap timeline (~weeks 6–7) for those phases.
