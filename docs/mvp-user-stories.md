# Tend MVP User Stories

## Product Summary

Tend is a lightweight life-maintenance app for remembering recurring things that matter without turning them into guilt-driven overdue tasks.

Instead of managing todos, users create things they want to tend: household care, health upkeep, relationships, pets, vehicles, and life admin. Tend tracks when each thing was last tended, how often the user wants to tend it, and gently brings attention to items that are drifting from their desired rhythm.

The MVP should answer one core question:

> What parts of my life could use attention now?

## MVP Principles

- No strict due dates for wants.
- No streaks.
- No red overdue punishment.
- No project management concepts.
- Setup must be fast enough for a user to add an item in under a minute.
- Reminders should create awareness, not pressure.
- The app should feel useful even if the user only opens it once or twice a week.

## Core Concepts

### Tend Item

A recurring thing the user wants to maintain.

Examples:

- Change bed sheets
- Water plants
- Dinner with partner
- Call parents
- Clean AC filter
- Take medication
- Pay electricity bill

### Type

The type defines how seriously the app treats the item.

- `Must`: important, time-sensitive, or needs stronger reminder behavior.
- `Want`: flexible, meaningful, and allowed to drift without guilt.

### Rhythm

How often the user wants the item to be tended.

Examples:

- Every 7 days
- Every 2 weeks
- Every month
- Every 3 months

### Last Tended

The timestamp of the last time the user completed or acknowledged the item.

### Status

A derived state based on rhythm and last tended date. MVP wording can change later, but the concept should avoid punitive language.

Suggested states:

- `Fresh`
- `Getting stale`
- `Needs attention`

### Availability

A simple weekly schedule of when the user is usually free. This is not calendar integration.

Example:

- Monday: 18:00-22:00
- Tuesday: 18:00-22:00
- Sunday: 12:00-18:00

## Pre-Alpha Scope Decisions

- Build web first so the product model can be tested before investing in mobile.
- Keep the data local-only for pre-alpha.
- Include basic local account creation with name, email, and password.
- Do not include production authentication, email verification, password reset, or cloud sync yet.
- Support recurring tend items only for now.
- Defer mobile-specific features, including native push notifications, until after the web pre-alpha proves useful.
- Keep mobile in the broader product direction, but do not let it shape the first build.

## Story Validation Summary

Reviewed against Mike Cohn + Gherkin format and INVEST criteria. Original stories were strong on product intent; these changes make them development-ready.

| Finding | Action taken |
| --- | --- |
| Acceptance criteria were feature bullets, not testable scenarios | Converted to Gherkin `Given / When / Then` |
| Generic "As a user" on most stories | Personas narrowed to `new pre-alpha user`, `returning user`, `busy returning user` |
| Stories 6–9 overlapped (view/edit/mark/archive) | Scoped each story to one user outcome; removed duplicate AC |
| Stories 12–13 were cross-cutting rules, not standalone flows | Merged into Stories 5 and 11 as explicit scenarios |
| Story 7 and Story 14 both covered correcting tended dates | Date correction lives in Story 14; Story 7 covers logging only |
| Missing summaries | Added value-focused summary per story |
| Open questions blocked some AC | Added recommended pre-alpha defaults below |

### Recommended pre-alpha defaults (resolve open questions for build)

1. **Life areas:** Optional; hidden behind presets and item edit—not required at creation.
2. **Must reminder persistence:** Strong emphasis on home and reminder surfaces until marked tended; no escalating nag loops in pre-alpha.
3. **Want reminder timing:** Derived from rhythm + availability (no per-item reminder range in pre-alpha).
4. **Status labels:** Use `Fresh`, `Getting stale`, `Needs attention` for MVP copy.
5. **Tending history:** Store multiple events in pre-alpha; home/detail surfaces show most recent; full list in Story 14.
6. **Snooze:** Out of scope; postponement via availability windows only.
7. **Presets at launch:** Include all listed life areas in Story 4.

## MVP User Stories

### User Story 1

- **Summary:** Create a local profile so Tend feels personal from the first visit

#### Use Case

- **As a** new pre-alpha user
- **I want to** create a local account with my name, email, and password
- **so that** Tend feels like my personal space even before cloud sync exists

#### Acceptance Criteria

**Scenario: New user creates a valid local account**

- **Given:** I am on the account creation screen
- **and Given:** I have not created a local profile on this device
- **When:** I enter a display name, a valid email address, and a password and submit
- **Then:** A local pre-alpha profile is created and I am signed in

**Scenario: Invalid signup is rejected**

- **Given:** I am on the account creation screen
- **When:** I submit with a missing name, invalid email format, or missing password
- **Then:** I see a clear validation message and no profile is created

**Scenario: Returning user accesses the same local profile**

- **Given:** I previously created a local profile on this device
- **When:** I open the app and sign in with my email and password
- **Then:** I reach my existing profile and tend items

**Note:** Pre-alpha copy must not promise cloud sync, email verification, or production password recovery.

---

### User Story 2

- **Summary:** Onboard quickly without configuring a productivity system

#### Use Case

- **As a** new pre-alpha user
- **I want to** understand what Tend is for and add my first item in onboarding
- **so that** I can start tracking meaningful recurring things without setup friction

#### Acceptance Criteria

**Scenario: User completes onboarding with a first item**

- **Given:** I just created my local account
- **and Given:** I am in the first-time setup flow
- **When:** I read the brief product explanation and create my first tend item
- **Then:** I land on the main attention screen with that item visible

**Scenario: User skips optional onboarding steps**

- **Given:** I am in the first-time setup flow
- **and Given:** An optional step such as availability or presets is offered
- **When:** I choose to skip the optional step
- **Then:** I reach the main app without creating projects, labels, or required categories

---

### User Story 3

- **Summary:** Capture a recurring item in under a minute

#### Use Case

- **As a** returning user
- **I want to** quickly add something I care about maintaining
- **so that** capturing an item does not feel like work

#### Acceptance Criteria

**Scenario: User adds an item with explicit last tended date**

- **Given:** I am signed in and on the main screen
- **and Given:** I open the quick-add flow
- **When:** I enter a name, choose `Must` or `Want`, set a rhythm, set a last tended date, and save
- **Then:** The item appears on the main screen with a derived status based on rhythm and last tended

**Scenario: User adds an item without setting last tended**

- **Given:** I am in the quick-add flow
- **When:** I save without choosing a last tended date
- **Then:** The app either defaults last tended to today or asks whether I have already tended it before saving

---

### User Story 4

- **Summary:** Start from sensible presets instead of a blank list

#### Use Case

- **As a** returning user setting up Tend
- **I want to** add suggested items for common life areas
- **so that** I do not have to invent rhythms and types from scratch

#### Acceptance Criteria

**Scenario: User adds a preset with defaults**

- **Given:** I am in the preset picker
- **and Given:** Presets exist for household, health, relationships, pets, vehicle, and admin
- **When:** I select a preset such as "Change bed sheets" and confirm without edits
- **Then:** A tend item is created with the preset's default type and rhythm and appears on the main screen

**Scenario: User customizes a preset before saving**

- **Given:** I selected a preset
- **When:** I change its type, rhythm, or last tended date and save
- **Then:** The saved item reflects my edits, not only the preset defaults

**Example presets:**

- Household: Change bed sheets, vacuum, clean bathroom, clean AC filter
- Health: Stretch, long walk, dental cleaning, check blood pressure
- Relationships: Dinner with partner, movie night, call parents, meet a friend
- Pets: Clean litter box, buy pet food, grooming
- Vehicle: Check tire pressure, oil change, car wash
- Admin: Pay bills, renew insurance, back up photos

---

### User Story 5

- **Summary:** See what needs attention first without scanning a todo backlog

#### Use Case

- **As a** returning user opening Tend
- **I want to** see which items most need attention on the home screen
- **so that** I know what to tend now without guilt-driven overdue language

#### Acceptance Criteria

**Scenario: Home screen prioritizes attention items**

- **Given:** I have active tend items with varied status and last tended dates
- **When:** I open the home screen
- **Then:** Items needing attention appear above items that are looking good, with musts ranked above wants when both need attention

**Scenario: Items show age, not failure**

- **Given:** I have wants that have drifted past their target rhythm
- **When:** I view the home screen
- **Then:** Each item shows how long ago it was last tended and uses status labels such as `Getting stale` or `Needs attention` rather than "overdue"

**Scenario: Musts and wants are visually distinct**

- **Given:** I have both must and want items on the home screen
- **When:** I scan the list
- **Then:** I can distinguish must items from want items at a glance

**Example display:**

- Needs attention: Bed sheets, last tended 11 days ago
- Getting stale: Dinner with partner, last tended 36 days ago
- Looking good: Plants, last tended 2 days ago

---

### User Story 6

- **Summary:** Understand why an item is being surfaced

#### Use Case

- **As a** returning user
- **I want to** open an item and see its rhythm, status, and recent history
- **so that** I understand why Tend is bringing it to my attention

#### Acceptance Criteria

**Scenario: User views item detail**

- **Given:** I have at least one tend item
- **When:** I open an item from the home screen
- **Then:** I see its name, type, rhythm, derived status, last tended date, and at least the most recent tended event

---

### User Story 7

- **Summary:** Log that something was tended so status stays accurate

#### Use Case

- **As a** returning user
- **I want to** mark an item as tended
- **so that** Tend remembers when I last handled it and stops surfacing it unnecessarily

#### Acceptance Criteria

**Scenario: User marks an item tended from the home screen**

- **Given:** An item appears in the attention area
- **When:** I mark it as tended from the home screen
- **Then:** Its last tended date updates to now, its status recalculates immediately, and it leaves the attention area if its rhythm is now satisfied

**Scenario: User marks an item tended from detail**

- **Given:** I am viewing an item's detail screen
- **When:** I mark it as tended
- **Then:** Its last tended date updates to now and the detail view reflects the new status

---

### User Story 8

- **Summary:** Keep item settings aligned with real life

#### Use Case

- **As a** returning user
- **I want to** edit an existing tend item
- **so that** Tend stays aligned when my priorities or rhythms change

#### Acceptance Criteria

**Scenario: User edits core item fields**

- **Given:** I am viewing or editing an existing item
- **When:** I change the name, type, rhythm, or last tended date and save
- **Then:** The item persists the updates and its derived status recalculates from the new values

---

### User Story 9

- **Summary:** Remove clutter without losing history when useful

#### Use Case

- **As a** returning user
- **I want to** archive or delete items I no longer want surfaced
- **so that** my attention list stays small and relevant

#### Acceptance Criteria

**Scenario: User archives an item**

- **Given:** I have an active tend item with history
- **When:** I archive the item
- **Then:** It no longer appears in the main attention list and its history remains stored

**Scenario: User permanently deletes an item**

- **Given:** I choose to delete an archived or active item
- **When:** I confirm permanent deletion
- **Then:** The item and its history are removed from the app

---

### User Story 10

- **Summary:** Tell Tend when I am usually free to act

#### Use Case

- **As a** busy returning user
- **I want to** set simple weekly free-time windows
- **so that** reminders can align with times I am more likely to act

#### Acceptance Criteria

**Scenario: User sets availability windows**

- **Given:** I am in availability settings
- **When:** I define one or more time windows for any day of the week and save
- **Then:** My weekly availability is stored locally without requiring external calendar access

**Scenario: User leaves some days empty**

- **Given:** I am editing availability
- **When:** I save with some weekdays having no windows
- **Then:** Those days are treated as unavailable and the app continues to work

**Scenario: App works without availability configured**

- **Given:** I have never set availability
- **When:** I use the main app and reminders
- **Then:** Core tending flows still function using non-availability fallback behavior

---

### User Story 11

- **Summary:** Get gentle in-app awareness instead of fake deadlines

#### Use Case

- **As a** returning user using the web app
- **I want to** see in-app reminders for items that could use attention
- **so that** I can act with awareness rather than deadline pressure

#### Acceptance Criteria

**Scenario: Reminder uses awareness-based copy**

- **Given:** An item needs attention
- **When:** I view the in-app reminder surface
- **Then:** The copy describes how long ago it was last tended or that it needs attention, without guilt-based or overdue language for wants

**Scenario: Want reminders respect availability**

- **Given:** I configured availability and a want item needs attention
- **When:** I am inside an availability window
- **Then:** The want may appear in reminders; outside that window it waits for the next available window unless I open the app directly

**Scenario: Must reminders receive stronger emphasis**

- **Given:** A must item needs attention
- **When:** I view the home or reminder surfaces
- **Then:** It receives stronger visual emphasis than wants needing attention

**Scenario: User tends from a reminder**

- **Given:** An item appears on the reminder surface
- **When:** I mark it as tended from that surface
- **Then:** It updates last tended and clears from the reminder surface if its rhythm is satisfied

**Example reminder copy:**

- "Your bed sheets were last tended 11 days ago."
- "You have free time this evening. Bed sheets and vacuuming could use attention."
- "Medication is marked as a must and needs attention."

**Note:** Native push notifications are out of scope for pre-alpha.

---

### User Story 12

- **Summary:** Use musts sparingly for what truly cannot drift

#### Use Case

- **As a** returning user creating or editing items
- **I want to** understand that musts receive stronger attention than wants
- **so that** I reserve must for important responsibilities and do not dilute the signal

#### Acceptance Criteria

**Scenario: User creates a recurring must**

- **Given:** I am creating or editing an item
- **When:** I set its type to `Must` and save
- **Then:** The item is stored as a recurring must and will be prioritized above wants when it needs attention

**Scenario: App communicates sparing use of musts**

- **Given:** I am choosing between `Must` and `Want` during item creation
- **When:** I view the type selector or helper copy
- **Then:** I see guidance that musts should be used sparingly for important items

---

### User Story 13

- **Summary:** Optionally group items by life area

#### Use Case

- **As a** returning user with many items
- **I want to** optionally assign and filter by life area
- **so that** I can see which kinds of care are drifting

#### Acceptance Criteria

**Scenario: User assigns a life area**

- **Given:** I am creating or editing an item
- **When:** I assign a life area such as household, health, relationships, pets, vehicle, admin, or personal
- **Then:** The item stores that area without requiring category setup to use the home screen

**Scenario: User filters by life area**

- **Given:** I have items across multiple life areas
- **When:** I filter or browse by a selected life area
- **Then:** I see only items in that area while the home screen remains useful without filtering

---

### User Story 14

- **Summary:** Review recent tending and fix logging mistakes

#### Use Case

- **As a** returning user
- **I want to** see what I recently tended and correct mistakes
- **so that** I stay oriented and my item statuses reflect reality

#### Acceptance Criteria

**Scenario: User reviews recent activity**

- **Given:** I have marked one or more items as tended
- **When:** I open the recent activity view
- **Then:** I see a simple list of item names with tended dates and no streaks or analytics charts

**Scenario: User corrects a mistaken tended event**

- **Given:** A tended event was logged incorrectly
- **When:** I edit or remove that event from recent activity
- **Then:** The item's last tended date and derived status recalculate from the corrected history

---

## Out of Scope for MVP

- Google Calendar, Apple Calendar, or Outlook integration
- Native mobile apps
- Native push notifications
- Cloud sync
- Production authentication flows such as email verification and password reset
- Shared households or multi-user collaboration
- One-time items
- Streaks
- Gamification
- Projects, subtasks, kanban boards, and productivity workflows
- Complex habit analytics
- AI scheduling
- Location-based reminders
- Payments or subscriptions
- Native widgets
- Social features
- Reminder snooze (postponement via availability only)
- Pause/resume as a separate item state from archive

## Open Product Questions

Most questions now have recommended pre-alpha defaults in **Story Validation Summary** above. Revisit before beta:

1. Final status label copy after user testing
2. How visually persistent must reminders should become before they feel annoying
3. Whether life-area filtering belongs in the first sprint or immediately after MVP cut
4. Whether pause/resume should be added after archive/delete has been tested

## Suggested MVP Cut

The smallest useful MVP should include:

- User Stories 1–3, 5, 7–11, and 14
- Story 4 presets (accelerates first-use value)
- Story 12 must guidance (light copy + prioritization rules)
- Defer Story 13 life-area filtering unless presets need explicit area tags

Everything else should be deferred unless it directly supports those flows.

## Non-Goals

Tend should not try to be:

- A productivity app
- A strict habit tracker
- A project manager
- A calendar replacement
- A personal optimization dashboard

The product should stay focused on helping users tend to the recurring parts of life that are easy to forget but important to maintain.
