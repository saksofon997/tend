### `GET /api/v1/onboarding`

Return onboarding status for the signed-in user.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ completed: boolean, onboardingCompletedAt: string \| null }` | Current status |
| 401 | `{ error: string }` | Not signed in |

---

### `PUT /api/v1/onboarding`

Mark onboarding complete. Idempotent — sets `onboarding_completed_at` to now if not already set.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completed | `true` | yes | Must be literal `true` |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ completed: true, onboardingCompletedAt: string }` | Onboarding marked complete |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{ "completed": true }
```
