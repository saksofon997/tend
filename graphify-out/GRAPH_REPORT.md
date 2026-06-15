# Graph Report - tend  (2026-06-15)

## Corpus Check
- 167 files · ~37,779 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 942 nodes · 1997 edges · 62 communities (54 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bce010c4`
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

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 47 edges
2. `cn()` - 36 edges
3. `jsonData()` - 33 edges
4. `requireUser()` - 28 edges
5. `jsonError()` - 27 edges
6. `isErrorResponse()` - 25 edges
7. `TendItemType` - 22 edges
8. `POST()` - 18 edges
9. `validateSession()` - 18 edges
10. `TendStatus` - 18 edges

## Surprising Connections (you probably didn't know these)
- `TypeBadgeProps` --references--> `TendItemType`  [EXTRACTED]
  apps/web/components/tend/type-badge.tsx → packages/domain/src/types.ts
- `PATCH()` --calls--> `updateEventForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/[eventId]/route.ts → packages/db/src/items.ts
- `DELETE()` --calls--> `deleteEventForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/[eventId]/route.ts → packages/db/src/items.ts
- `GET()` --calls--> `listRecentEventsForUser()`  [EXTRACTED]
  apps/web/app/api/v1/activity/route.ts → packages/db/src/items.ts
- `GET()` --calls--> `getRecentEventsForItem()`  [EXTRACTED]
  apps/web/app/api/v1/items/[id]/route.ts → packages/db/src/items.ts

## Import Cycles
- None detected.

## Communities (62 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (76): getSessionIdFromResponse(), registerTestUser(), uniqueEmail(), GET(), formatZodError(), ListActivityQuery, listActivityQuerySchema, optionalIsoDateSchema (+68 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (40): availabilityWindowSchema, replaceAvailabilitySchema, timeSchema, groupForAttention(), SortedTendItem, sortForAttention(), STATUS_RANK, now (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.50
Nodes (4): config, isPublicPath(), middleware(), PUBLIC_PATHS

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (41): devDependencies, @biomejs/biome, turbo, typescript, name, overrides, drizzle-orm, packageManager (+33 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (39): ActivityListItem, Alert, AppShell, AttentionHero, AttentionSection, AuthForm, AvailabilityEditor, Button (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): After pre-alpha, API surface (`/api/v1`), Attention ordering, `availability_windows`, Core, Data model, Definition of done (pre-alpha), Domain logic (`packages/domain`) (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (35): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, lucia, @lucia-auth/adapter-drizzle, lucide-react (+27 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): 10. Accessibility, 11. shadcn theming notes, 12. Reference mood, 1. Design principles, 2. Visual personality, 3. Typography, 4. Color system, 5. Spacing & layout (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (34): serializeAvailabilityWindow(), toDomainAvailabilityWindow(), GET(), checkHealth(), HealthResult, AvailabilityWindowInput, AvailabilityWindowRow, deleteAvailabilityWindowsForUser() (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (29): ActivityListItemProps, AppShellProps, AttentionHeroProps, AttentionSectionProps, AuthFormData, AuthFormProps, AvailabilityEditorProps, AvailabilityWindow (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (22): ItemDraft, Step, STEP_MAP, ItemForm(), ItemFormProps, ItemFormValues, itemFormClientSchema, validateItemForm() (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (11): formatRhythm(), AuthFormData, AuthFormProps, ItemDetailView(), PresetCard(), Card, CardContent, CardDescription (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (26): AvailabilityWindowResponse, SignOutButton(), AddItemFormProps, AvailabilityEditor(), AvailabilityEditorProps, DAYS, EditableWindow, ItemResponse (+18 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (12): FormField(), FormFieldProps, OnboardingStep(), OnboardingStepProps, cn(), AttentionSection(), AttentionSectionProps, Badge() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (22): adapter, AuthUser, lucia, LuciaAuthUser, toAuthUser(), applySessionCookie(), clearSessionCookie(), getSessionIdFromRequest() (+14 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, postgres, devDependencies, dotenv, drizzle-kit, exports, name (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (20): LIFE_AREA_LABELS, STATUS_LABELS, statusStyles(), TYPE_LABELS, typeStyles(), LIFE_AREA_ORDER, LifeArea, TendStatus (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (9): AttentionListItem, formatRelativeFromDays(), formatRelativeTended(), heroAttentionCopy(), startOfDay(), AttentionHero(), AttentionHeroProps, RelativeTime() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (14): files, ignore, formatter, enabled, indentStyle, indentWidth, lineWidth, linter (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (15): 1. Clone and install, 2. Environment, 3. Database, 4. Development, API documentation, Getting started, License, Manual QA (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (13): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (6): AuthForm(), LoginForm(), RegisterForm(), AuthLayout(), AuthLayoutProps, readApiError()

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (10): `DELETE /api/v1/items/:id?confirm=true`, `GET /api/v1/items`, `GET /api/v1/items/:id`, `GET /api/v1/items/presets`, `Item`, `PATCH /api/v1/items/:id`, `POST /api/v1/items`, `POST /api/v1/items/:id/tend` (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (10): MVP Principles, Non-Goals, Open Product Questions, Out of Scope for MVP, Pre-Alpha Scope Decisions, Product Summary, Recommended pre-alpha defaults (resolve open questions for build), Story Validation Summary (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (17): ActivityPage(), serializeActivityEntry(), HomePage(), validateSession(), OnboardingFlow(), AddItemForm(), ItemDetailPage(), ItemDetailPageProps (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (4): AttentionGroups, buildAttentionGroups(), sortForAttention(), STATUS_RANK

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
Nodes (7): Acceptance Criteria, Acceptance Criteria, MVP User Stories, Use Case, Use Case, User Story 1, User Story 10

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
Cohesion: 0.67
Nodes (3): Acceptance Criteria, Use Case, User Story 9

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
Nodes (3): Acceptance Criteria, Use Case, User Story 14

### Community 56 - "Community 56"
Cohesion: 0.11
Nodes (17): Notes for testers, Smoke checks, Story 10 — Availability, Story 11 — In-app reminders, Story 12 — Must vs want guidance, Story 13 — Life area filter, Story 14 — Recent activity, Story 1 — Local account (+9 more)

### Community 59 - "Community 59"
Cohesion: 0.27
Nodes (11): ActivityEntryResponse, formatEventDate(), TendEventResponse, dateInputToIso(), isoToDateInputValue(), ActivityListItem(), ActivityListItemProps, ActivityViewProps (+3 more)

### Community 60 - "Community 60"
Cohesion: 0.24
Nodes (11): buildAggregatedReminderCopy(), buildReminderCopy(), freeTimePhrase(), ReminderCopyInput, ReminderResponse, RemindersApiResponse, serializeReminder(), toTendItemInput() (+3 more)

## Knowledge Gaps
- **423 isolated node(s):** `RouteContext`, `RouteContext`, `RouteContext`, `ItemDetailPageProps`, `display` (+418 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 8`, `Community 25`, `Community 12`, `Community 14`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `LifeArea` connect `Community 16` to `Community 0`, `Community 1`, `Community 10`, `Community 12`, `Community 59`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 13` to `Community 10`, `Community 11`, `Community 12`, `Community 16`, `Community 17`, `Community 22`, `Community 59`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `RouteContext`, `RouteContext`, `RouteContext` to the rest of the system?**
  _423 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06574923547400612 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06174863387978142 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._