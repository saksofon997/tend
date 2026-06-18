### `GET /api/v1/settings`

Return saved settings for the signed-in user.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ settings: UserSettings }` | Current settings |
| 401 | `{ error: string }` | Not signed in |
| 404 | `{ error: string }` | Settings row missing |

---

### `PUT /api/v1/settings`

Update saved user settings. The timezone controls how availability windows are interpreted for reminders and mobile notifications.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timezone | string | yes | IANA timezone, for example `Europe/Belgrade` |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ settings: UserSettings }` | Settings saved |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

**UserSettings**

| Field | Type | Description |
|-------|------|-------------|
| timezone | string | IANA timezone used for availability |
| onboardingCompletedAt | ISO datetime \| null | Onboarding completion timestamp |

**Example**

```json
{ "timezone": "Europe/Belgrade" }
```
