# Graph Report - tend  (2026-06-15)

## Corpus Check
- 212 files · ~60,895 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1150 nodes · 2302 edges · 71 communities (64 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `91e701c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 47 edges
2. `cn()` - 44 edges
3. `jsonData()` - 33 edges
4. `requireUser()` - 28 edges
5. `jsonError()` - 27 edges
6. `isErrorResponse()` - 25 edges
7. `validateSession()` - 22 edges
8. `TendItemType` - 22 edges
9. `POST()` - 19 edges
10. `TendStatus` - 18 edges

## Surprising Connections (you probably didn't know these)
- `PATCH()` --calls--> `updateEventForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/[eventId]/route.ts → packages/db/src/items.ts
- `DELETE()` --calls--> `deleteEventForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/[eventId]/route.ts → packages/db/src/items.ts
- `GET()` --calls--> `listRecentEventsForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/route.ts → packages/db/src/items.ts
- `PATCH()` --calls--> `updateItemForUser()`  [EXTRACTED]
  apps/web/app/api/v1/items/[id]/route.ts → packages/db/src/items.ts
- `DELETE()` --calls--> `deleteItemForUser()`  [EXTRACTED]
  apps/web/app/api/v1/items/[id]/route.ts → packages/db/src/items.ts

## Import Cycles
- None detected.

## Communities (71 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (73): GET(), formatZodError(), ListActivityQuery, listActivityQuerySchema, optionalIsoDateSchema, UpdateEventInput, updateEventSchema, HomePage() (+65 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (50): availabilityWindowSchema, replaceAvailabilitySchema, timeSchema, buildAggregatedReminderCopy(), buildReminderCopy(), freeTimePhrase(), ReminderCopyInput, ReminderResponse (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.26
Nodes (8): allowsUnauthenticatedAccess(), isPublicPath(), isStaticAssetPath(), PUBLIC_PATHS, getCanonicalAppHost(), isVercelAppHost(), config, middleware()

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (46): devDependencies, @biomejs/biome, husky, turbo, typescript, name, overrides, drizzle-orm (+38 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (17): ActivityListItem, AttentionHero, AttentionSection, Domain components, EmptyState, LifeAreaChip, LifeAreaFilter, MarkTendedButton (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): After pre-alpha, API surface (`/api/v1`), Attention ordering, `availability_windows`, Core, Data model, Definition of done (pre-alpha), Domain logic (`packages/domain`) (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (38): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, lucia, @lucia-auth/adapter-drizzle, lucide-react (+30 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): 10. Accessibility, 11. shadcn theming notes, 12. Reference mood, 1. Design principles, 2. Visual personality, 3. Typography, 4. Color system, 5. Spacing & layout (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (39): serializeAvailabilityWindow(), toDomainAvailabilityWindow(), GET(), checkHealth(), HealthResult, AvailabilityWindowInput, AvailabilityWindowRow, deleteAvailabilityWindowsForUser() (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (29): ActivityListItemProps, AppShellProps, AttentionHeroProps, AttentionSectionProps, AuthFormData, AuthFormProps, AvailabilityEditorProps, AvailabilityWindow (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (11): CreateItemInput, createItemSchema, lifeAreaSchema, listItemsQuerySchema, optionalIsoDateSchema, rhythmDaysSchema, TendItemInput, tendItemSchema (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (37): API surface (Phases 1–4 additions), Current state (pre-alpha gaps), Definition of done (Phases 1–4), Implementation phases, Iteration 1.1 — Route split & public middleware, Iteration 1.2 — Landing page, Iteration 1.3 — Sample legal pages, Iteration 1.4 — Site footer (+29 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (22): ActivityPage(), ActivityEntryResponse, serializeActivityEntry(), AvailabilityWindowResponse, AvailabilityEditor(), AvailabilityEditorProps, DAYS, EditableWindow (+14 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (9): FormFieldProps, UserMenu(), Badge(), BadgeProps, badgeVariants, DropdownMenuContent, DropdownMenuItem, Label (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (33): After alpha, Alpha scope, Alpha shortcut, Candidate new life areas (pick 4–6), Cross-cutting alpha checklist, Current constraint, Definition of done (alpha), Deliverables (+25 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, postgres, devDependencies, dotenv, drizzle-kit, exports, name (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (26): formatRelativeFromDays(), formatRelativeTended(), formatRhythm(), heroAttentionCopy(), startOfDay(), LIFE_AREA_LABELS, STATUS_LABELS, statusStyles() (+18 more)

### Community 17 - "Community 17"
Cohesion: 0.19
Nodes (11): AttentionListItem, ItemResponse, AttentionHeroProps, AttentionSection(), AttentionSectionProps, EmptyState(), EmptyStatePresetProps, EmptyStateProps (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (14): files, ignore, formatter, enabled, indentStyle, indentWidth, lineWidth, linter (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (21): 1. Clone and install, 2. Environment, 3. Database, 4. Development, Alpha — next, API documentation, Deployment, Development (+13 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (13): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.08
Nodes (23): AuthForm(), LoginForm(), RegisterForm(), AuthLayout(), AuthLayoutProps, SiteFooter(), TendLogoLink(), TendLogoLinkProps (+15 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (10): `DELETE /api/v1/items/:id?confirm=true`, `GET /api/v1/items`, `GET /api/v1/items/:id`, `GET /api/v1/items/presets`, `Item`, `PATCH /api/v1/items/:id`, `POST /api/v1/items`, `POST /api/v1/items/:id/tend` (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (10): MVP Principles, Non-Goals, Open Product Questions, Out of Scope for MVP, Pre-Alpha Scope Decisions, Product Summary, Recommended pre-alpha defaults (resolve open questions for build), Story Validation Summary (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (31): ItemDraft, Step, STEP_MAP, AddItemForm(), AddItemFormProps, ItemForm(), ItemFormProps, ItemFormValues (+23 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (22): 1. Neon — PostgreSQL, 2. Vercel — Next.js app, 3. Cloudflare — DNS for DigitalPlat domain, 4. Post-deploy checklist, Apply migrations locally (first time), Auth cookies not sticking, Block direct `.vercel.app` access, Build fails on `db:migrate` (+14 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (8): Agent instructions, Documents, Domain types to import, File layout, Implementation status, Intended stack, Reusable components, Tend Design System

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (7): exports, name, private, scripts, test, type, version

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, include

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (7): Acceptance Criteria, Acceptance Criteria, MVP User Stories, Use Case, Use Case, User Story 10, User Story 14

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (7): Availability, Core Concepts, Last Tended, Rhythm, Status, Tend Item, Type

### Community 32 - "Community 32"
Cohesion: 0.43
Nodes (5): client, db, isStartupError(), STARTUP_ERROR_CODES, waitForDatabase()

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (5): `GET /api/v1/me`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/register`, `User`

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (4): Changelog, Conventions, Resources, Tend HTTP API

### Community 35 - "Community 35"
Cohesion: 0.40
Nodes (3): body, display, metadata

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (4): compilerOptions, rootDir, extends, include

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (3): `DELETE /api/v1/activity/:eventId`, `GET /api/v1/activity`, `PATCH /api/v1/activity/:eventId`

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 2

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 3

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 4

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 5

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 6

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 7

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 8

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (7): Acceptable use, Availability, Contact, Data and privacy, Terms of Service, The service, Your account

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 11

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 12

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 13

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 1

### Community 56 - "Community 56"
Cohesion: 0.11
Nodes (17): Notes for testers, Smoke checks, Story 10 — Availability, Story 11 — In-app reminders, Story 12 — Must vs want guidance, Story 13 — Life area filter, Story 14 — Recent activity, Story 1 — Local account (+9 more)

### Community 59 - "Community 59"
Cohesion: 0.16
Nodes (22): formatEventDate(), AuthFormData, AuthFormProps, FormField(), TendEventResponse, dateInputToIso(), isoToDateInputValue(), ActivityListItem() (+14 more)

### Community 60 - "Community 60"
Cohesion: 0.22
Nodes (7): AttentionGroups, buildAttentionGroups(), hasItemsNeedingAttention(), shouldShowAllFreshBanner(), sortForAttention(), STATUS_RANK, HomeView()

### Community 61 - "Community 61"
Cohesion: 0.11
Nodes (28): isEmailAllowed(), isRegistrationRestricted(), parseAllowedEmails(), adapter, AuthUser, lucia, LuciaAuthUser, toAuthUser() (+20 more)

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (7): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product, Product Purpose, Users

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): Contact, How we use your data, Privacy Policy, Retention and deletion, What we store, Where data is hosted

### Community 64 - "Community 64"
Cohesion: 0.50
Nodes (3): buildCommand, installCommand, $schema

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 9

### Community 66 - "Community 66"
Cohesion: 0.22
Nodes (8): Example: Home page composition, LandingPage, LegalPage, lib helpers, Marketing, Migration from current code, Quick reference, Tend Component Catalog

### Community 67 - "Community 67"
Cohesion: 0.22
Nodes (9): Alert, Button, Card, DropdownMenu, FormField, Input, PasswordInput, Primitives (shadcn-themed) (+1 more)

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (8): AppShell, Layout, OnboardingStep, PageHeader, PromoCarousel, SiteFooter, TendLogoLink, UserMenu

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (7): AuthForm, AvailabilityEditor, ConfirmDialog, Forms (composite), ItemDetailView, ItemForm, TendEventRow

### Community 70 - "Community 70"
Cohesion: 0.43
Nodes (4): PromoCarousel(), PromoCarouselProps, ONBOARDING_PROMO_SLIDES, OnboardingPromoSlide

## Knowledge Gaps
- **543 isolated node(s):** `husky.sh script`, `RouteContext`, `RouteContext`, `RouteContext`, `ItemDetailPageProps` (+538 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 8`, `Community 12`, `Community 61`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `LifeArea` connect `Community 25` to `Community 16`, `Community 0`, `Community 17`, `Community 1`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 16` to `Community 70`, `Community 12`, `Community 13`, `Community 17`, `Community 22`, `Community 25`, `Community 59`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `husky.sh script`, `RouteContext`, `RouteContext` to the rest of the system?**
  _543 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07305470608222901 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.050721954831543875 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._