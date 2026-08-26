# Tend Pre-Alpha Manual Test Script

Run through this checklist on a clean local setup before sharing the pre-alpha with testers. Each section maps to a user story in [`mvp-user-stories.md`](./mvp-user-stories.md).

**Prerequisites:** `bun install`, `.env` configured, `bun run setup:db`, `bun run dev` at [http://localhost:3000](http://localhost:3000).

---

## Story 1 — Local account

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Open `/register` | Registration form with pre-alpha notice (no cloud sync) |
| 1.2 | Submit with empty fields | Field-level validation messages; no account created |
| 1.3 | Submit with invalid email | Email validation message |
| 1.4 | Register with name, valid email, password (8+ chars) | Signed in; redirected to onboarding or home |
| 1.5 | Sign out (if exposed) or use `/login` | Login form loads |
| 1.6 | Sign in with wrong password | Clear error message |
| 1.7 | Sign in with correct credentials | Reaches existing profile and items |

---

## Story 2 — Onboarding

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | Complete onboarding with a first item | Lands on home with item visible |
| 2.2 | New account: skip optional steps | Reaches home without forced availability or presets |

---

## Story 3 — Quick add item

| Step | Action | Expected |
|------|--------|----------|
| 3.1 | From home, open **Add item** | Item form loads |
| 3.2 | Submit with empty name | "Name is required" on field |
| 3.3 | Create item with name, type, rhythm, last tended today | Item appears on home with derived status |
| 3.4 | Create item without changing last tended | Defaults to today |

---

## Story 4 — Presets

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Open preset picker (onboarding or add flow) | Presets grouped by life area |
| 4.2 | Add a preset without edits | Item created with preset defaults |
| 4.3 | Customize type/rhythm/last tended before save | Saved item reflects edits |

---

## Story 5 — Home attention view

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Open home with mixed-status items | Needs attention above getting stale above looking good |
| 5.2 | Compare must vs want both needing attention | Must ranked above want |
| 5.3 | Check copy on stale wants | Age-based language; no "overdue" |
| 5.4 | Empty account home | "Nothing to tend yet" empty state with add CTA |
| 5.5 | All items fresh | "Nothing needs attention right now" empty state |

---

## Story 6 — Item detail

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | Open an item from home | Name, type, rhythm, status, last tended, recent events |

---

## Story 7 — Mark tended

| Step | Action | Expected |
|------|--------|----------|
| 7.1 | Mark tended from home list | Status updates; item moves sections if rhythm satisfied |
| 7.2 | Mark tended from item detail | Last tended updates on detail view |
| 7.3 | Mark tended from reminder banner | Item clears from reminders when fresh |

---

## Story 8 — Edit item

| Step | Action | Expected |
|------|--------|----------|
| 8.1 | Edit name, type, rhythm, last tended on detail | Changes persist; status recalculates |

---

## Story 9 — Archive / delete

| Step | Action | Expected |
|------|--------|----------|
| 9.1 | Archive an item | Removed from home; history retained |
| 9.2 | Permanently delete (with confirmation) | Item and history removed |

---

## Story 10 — Availability

| Step | Action | Expected |
|------|--------|----------|
| 10.1 | Open `/settings/availability` with no windows | "No availability set yet" empty state |
| 10.2 | Add windows for Mon/Wed and save | Success message; windows persist on reload |
| 10.3 | Leave some days empty and save | App continues to work |
| 10.4 | Use app without ever setting availability | Core tending flows still work |

---

## Story 11 — In-app reminders

| Step | Action | Expected |
|------|--------|----------|
| 11.1 | Item getting stale or needs attention | Appears in reminder banner with awareness copy |
| 11.2 | Must needing attention | Stronger emphasis than wants |
| 11.3 | Want + availability configured | Want surfaces during availability window |

---

## Story 12 — Must vs want guidance

| Step | Action | Expected |
|------|--------|----------|
| 12.1 | Create/edit item type selector | Guidance that musts should be used sparingly |

---

## Story 13 — Life area filter

| Step | Action | Expected |
|------|--------|----------|
| 13.1 | Assign life area on create/edit | Stored on item |
| 13.2 | Filter home by life area chip | Only matching items shown |
| 13.3 | Filter with no matches | "No items in this area" empty state |

---

## Story 14 — History

| Step | Action | Expected |
|------|--------|----------|
| 14.1 | Open `/history` with no events | "No tending logged yet" empty state |
| 14.2 | Mark items tended | Events appear with item name and date |
| 14.3 | Edit event date from history | Item status recalculates |
| 14.4 | Delete event from history | Item last tended updates from remaining history |

---

## Smoke checks

| Step | Action | Expected |
|------|--------|----------|
| S.1 | `GET /api/v1/health` | `{ status: "ok" }` with database connected |
| S.2 | `bun run test` | All tests pass |
| S.3 | `bun run lint` | No errors on changed files |

---

## Notes for testers

- Data stays on this machine only — no cloud sync or password reset.
- Use Chrome or Safari latest; report issues with steps to reproduce.
