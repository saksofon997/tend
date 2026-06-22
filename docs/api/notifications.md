### `POST /api/v1/push-subscriptions`

Save or refresh the signed-in user's Expo push token for server-side reminder notifications.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | yes | Expo push token, for example `ExpoPushToken[...]` |
| platform | `"ios"` \| `"android"` | yes | Device platform |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 201 | `{ subscription: PushSubscription }` | Token saved |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{ "token": "ExpoPushToken[example]", "platform": "ios" }
```

---

### `DELETE /api/v1/push-subscriptions`

Remove a saved Expo push token for the signed-in user.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | yes | Expo push token to remove |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Token removed if present |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

---

### `GET /api/v1/jobs/notifications`

Run the server-side reminder notification job manually. Production scheduling is handled by the standalone Node worker (`bun run notifications:worker`), which runs the same job every 30 minutes by default and sends at most one relevant push per device when a notification is due.

**Auth:** `Authorization: Bearer <NOTIFICATIONS_JOB_SECRET>` or `Authorization: Bearer <CRON_SECRET>` (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `NotificationJobResult` | Job completed |
| 401 | `{ error: string }` | Missing or invalid bearer token |

**NotificationJobResult**

| Field | Type | Description |
|-------|------|-------------|
| checked | number | Saved subscriptions considered |
| sent | number | Push notifications accepted by Expo |
| skipped | number | Subscriptions with no due notification |
| failed | number | Push attempts that failed |
| invalidated | number | Invalid tokens removed after Expo rejected them |

**Notes**

- Reminder eligibility uses the same item, availability, timezone, and priority rules as `GET /api/v1/reminders`.
- Notifications defer to the user's next availability window when one is configured.
- Repeats for the same item on the same device are throttled for 23 hours.
