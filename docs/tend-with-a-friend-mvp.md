# Tend with a Friend MVP

## Status

- **MVP state:** Implemented for web, mobile, API, and database.
- **Last updated:** 2026-06-22.
- **Primary implementation surfaces:** item create/edit, home lists, item detail, reminders, activity, onboarding promo, and landing page promo.
- **Primary API surface:** `sharedWithEmail` on item create/update requests, and `sharedWith` on serialized item responses.

## Feature Goal

Tend with a Friend lets one recurring Tend appear for two Tend users when a friend email is added during create or edit. The goal is to make relationship-oriented maintenance feel shared without turning Tend into a social network, chat surface, task assignment tool, or accountability system.

The MVP supports quiet shared awareness for real-life moments such as dinner with a partner, hanging out with a friend, getting in touch, checking in with family, or a shared household rhythm. Either person can mark the shared Tend as tended; both people see the updated rhythm afterward.

## Product Direction

Tend remains a life-maintenance app first. The social layer should feel like a soft extension of care, not a collaboration product.

This feature should make Tend feel more human, not more collaborative. The best version is lightweight enough that a user can add "Dinner with Mira" or "Call Dad" without thinking about permissions, assignment, or whether the other person has "done their part."

Core product posture:

- Shared care is still care, not task management.
- A shared Tend has one rhythm and one history.
- The other person is context, not an assignee.
- The app should not imply blame when a shared rhythm drifts.
- The label should explain the social context without adding a new surface users have to manage.
- Shared Tends keep the same `Want` / `Must`, rhythm, status, and last-tended model.
- Marking a shared Tend as tended is single-action and shared; the second person does not need to confirm or separately complete it.
- Friend sharing requires an existing Tend account for MVP. Invites, email verification, friend requests, permissions, chat, comments, assignment, and notifications to the other user are out of scope.
- Sharing is optional and limited to one friend per Tend for MVP.

## MVP Scope

### In Scope

- Add optional friend email to web and mobile item create/edit forms.
- Resolve friend email to an existing Tend user.
- Show the item on both users' home, detail, activity, and reminder surfaces.
- Let either user mark the item as tended.
- Show the other user's display name with a `With {{name}}` label next to `Want` / `Must`.
- Update landing page hero copy, carousel content, and product feature section.
- Add onboarding promo imagery for the feature in the web onboarding carousel, landing carousel, and mobile auth/onboarding carousel.

### Out of Scope

- Pending invites for non-users.
- Multi-person groups.
- Friend lists or contact import.
- Per-user completion state.
- Chat, comments, reactions, nudges, or activity notifications.
- Private fields per participant.
- Separate owner/friend permissions beyond the MVP rules below.

## MVP Behavior Contract

### Sharing

- A Tend can be shared with at most one other Tend user.
- Sharing is created or changed by submitting `sharedWithEmail` from item create/edit.
- Empty `sharedWithEmail` means no sharing on create and removes sharing on update.
- The friend email must resolve to an existing Tend account.
- Invalid email format is rejected by field validation.
- Unknown friend email is rejected by the API with a clear validation error.
- Sharing with yourself is not a valid use case and should be rejected.

### Visibility

- The owner and the shared-with user can both see the Tend in active item lists.
- The owner and shared-with user can both open the item detail view.
- The shared Tend appears in reminder and activity surfaces for both participants.
- `sharedWith` in API responses is relative to the current user:
  - Owner sees the friend's display name and email.
  - Friend sees the owner's display name and email.

### Labels

- Shared Tends must show `With {{name}}` next to the `Want` / `Must` label.
- The label should use the other participant's display name, not email, wherever a display name is available.
- The label must be visible on dense scan surfaces, including home cards and reminder banners.
- The label is context only; it must not introduce assignment language such as "assigned to" or "waiting on."

### Tending

- Either participant can mark the shared Tend as tended.
- Marking as tended creates one shared event and updates the Tend's shared `lastTendedAt`.
- The second participant does not need to confirm, approve, or separately mark the item.
- Activity history is shared for the item because the item has one history.

### Edit and Delete

- Either participant can edit the shared Tend's normal item fields in the MVP.
- Editing `sharedWithEmail` changes or removes the shared participant.
- Permanent delete is owner-only in the data layer.
- Archiving follows item access rules and should be treated carefully in validation because it affects both participants' visibility.

## Data Model

The MVP stores sharing directly on `tend_items`.

| Field | Purpose |
| --- | --- |
| `userId` | Original owner/creator of the Tend |
| `sharedWithUserId` | Optional second participant; `null` means not shared |
| `lastTendedAt` | Shared last-tended timestamp for both participants |
| `status` | Shared derived status for both participants |

Important constraints:

- `sharedWithUserId` references `users.id`.
- If the shared-with user is deleted, `sharedWithUserId` is set to `null`.
- Tend events remain attached to the item, not to a participant.
- List and detail queries use access rules equivalent to "owner or shared-with user."
- Delete uses owner-only access.

## API Contract

See [`api/items.md`](./api/items.md) for request and response details. The MVP-specific API additions are:

- `POST /api/v1/items` accepts optional `sharedWithEmail`.
- `PATCH /api/v1/items/:id` accepts optional `sharedWithEmail`; `null` removes sharing.
- `GET /api/v1/items` returns items owned by or shared with the current user.
- `GET /api/v1/items/:id` allows either participant to fetch the item.
- `POST /api/v1/items/:id/tend` allows either participant to mark it tended.
- Serialized `Item` includes `sharedWith: SharedUser | null`.

## UX Surfaces

### Web App

- Item create form includes an optional "Tend with a friend" email field.
- Item edit form shows the current friend's email when a Tend is shared.
- Home item cards show the `With {{name}}` label next to `Want` / `Must`.
- Item detail shows the same label so the shared context carries into detail view.
- Reminder surfaces show the label so shared reminders are distinguishable.
- Activity includes shared item activity for both participants.

### Mobile App

- Add/edit flows include the same optional friend email field.
- Mobile validation mirrors the web form's friend email validation.
- Home cards and reminder banners show the `With {{name}}` label beside the type label.
- Mobile API types include `sharedWith` so the UI can render labels consistently.
- Auth/onboarding promo slides include the Tend with a Friend promo image.

### Landing and Promo

- Landing hero copy now mentions recurring care that can be tended alone or together.
- The landing carousel includes a Tend-style promo mockup for Tend with a Friend.
- The main product feature section includes the "Care can belong to two people" content, with the dinner-table image beside the section intro.
- The supporting feature points are:
  - "Tend with a friend"
  - "Shared without pressure"
  - "One tended moment is enough"

## Validation Notes

The idea fits Tend when positioned as shared care, not accountability. The riskiest assumption is that users are comfortable with a shared item changing when either person marks it tended. MVP validation should watch whether this feels relieving or confusing.

Success signals:

- Users can explain what `With {{name}}` means without support copy.
- Users naturally create relationship-oriented items, not only household chores.
- Either-person marking feels acceptable for dinner/check-in/hangout use cases.
- Users do not expect chat, invitations, or per-person checkoffs in the first session.

Validation questions:

- Do users understand that one tended action updates both people?
- Do users trust the other person being able to edit or mark the Tend?
- Does `With {{name}}` provide enough context without explaining the feature repeatedly?
- Are unknown-email errors acceptable for MVP, or do users immediately expect invitations?
- Do shared relationship items feel different enough from household chores to justify the feature?

MVP analytics or manual review should capture:

- Number of Tends created with `sharedWithEmail`.
- Share creation failure reason, especially unknown friend email.
- Whether shared Tends are later unshared.
- Whether shared Tends are marked tended by owner, friend, or both across time.
- Qualitative feedback on confusion around shared history.

## Easy Wins Added With MVP

- Friend sharing uses the same status and label language across web and mobile.
- Product copy keeps the feature framed around shared care instead of accountability.
- Promo material now shows the feature in both product context and emotional context.
- Shared item access applies to activity and reminders, not only the home list.

## Post-MVP Decisions

Do not add these until the MVP has evidence that users understand and want shared Tends:

- Invite flow for people without Tend accounts.
- Friend request or contact list model.
- More than two participants on one Tend.
- Per-person completion state.
- Shared Tend notification to the other participant.
- Ownership transfer.
- Per-participant archive/hide.
- Activity attribution showing who marked the Tend.

## Web App User Stories

### User Story TWF-W1

- **Summary:** Create a shared Tend from the web app

#### Use Case

- **As a** returning Tend user maintaining a relationship rhythm
- **I want to** add a friend's email while creating a Tend
- **so that** the same rhythm appears for both of us

#### Acceptance Criteria

**Scenario: User creates a Tend with an existing friend**

- **Given:** I am signed in on the web app
- **and Given:** my friend already has a Tend account
- **When:** I create a Tend with my friend's email
- **Then:** the Tend is saved and appears in both users' active item lists with a `With {{name}}` label

**Scenario: User enters an unknown friend email**

- **Given:** I am creating a Tend on the web app
- **When:** I submit a friend email that does not belong to a Tend account
- **Then:** the item is not saved as shared and I see a clear validation message

### User Story TWF-W2

- **Summary:** Edit sharing on an existing web Tend

#### Use Case

- **As a** returning Tend user
- **I want to** add, change, or remove a friend email while editing a Tend
- **so that** shared care can match the current relationship or routine

#### Acceptance Criteria

**Scenario: User updates friend sharing**

- **Given:** I am signed in on the web app
- **and Given:** I am editing an existing Tend
- **When:** I add or replace the friend email and save
- **Then:** the Tend appears for the selected friend and shows the updated `With {{name}}` label

**Scenario: User removes friend sharing**

- **Given:** I am editing a shared Tend
- **When:** I clear the friend email and save
- **Then:** the Tend is no longer shared and the `With {{name}}` label is removed

### User Story TWF-W3

- **Summary:** Mark a shared Tend as tended from the web app

#### Use Case

- **As a** shared Tend participant
- **I want to** mark the shared Tend as tended
- **so that** both users see the care moment reflected without duplicate confirmation

#### Acceptance Criteria

**Scenario: Either participant marks the shared Tend**

- **Given:** a Tend is shared between two users
- **When:** either user marks it as tended from the web app
- **Then:** the Tend's last tended date and status update for both users

## Mobile User Stories

### User Story TWF-M1

- **Summary:** Create a shared Tend from mobile

#### Use Case

- **As a** mobile Tend user
- **I want to** add a friend's email while creating a Tend
- **so that** shared real-life rhythms are captured from my phone

#### Acceptance Criteria

**Scenario: Mobile user creates a shared Tend**

- **Given:** I am signed in on mobile
- **and Given:** my friend already has a Tend account
- **When:** I save a new Tend with my friend's email
- **Then:** the Tend appears in both users' lists with the friend label beside `Want` or `Must`

### User Story TWF-M2

- **Summary:** Edit a shared Tend from mobile

#### Use Case

- **As a** mobile Tend user
- **I want to** edit the friend email on an existing Tend
- **so that** I can add or remove sharing without switching to web

#### Acceptance Criteria

**Scenario: Mobile user changes shared friend**

- **Given:** I am editing a Tend on mobile
- **When:** I update the friend email and save
- **Then:** the API saves the updated sharing state and the mobile list reflects the new `With {{name}}` label

### User Story TWF-M3

- **Summary:** Mark a shared Tend as tended from mobile

#### Use Case

- **As a** mobile shared Tend participant
- **I want to** mark the Tend as tended from the home list or reminder banner
- **so that** both people can rely on one shared care history

#### Acceptance Criteria

**Scenario: Mobile participant marks a shared Tend**

- **Given:** a Tend is shared with me
- **When:** I mark it as tended on mobile
- **Then:** the Tend updates for both users and remains labeled with the other person's name
