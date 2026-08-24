### `POST /api/v1/push-subscriptions`

Save or refresh the signed-in user's native FCM device token for server-side reminder notifications.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | yes | Native FCM device token returned by the mobile app |
| platform | `"ios"` \| `"android"` | yes | Device platform |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 201 | `{ subscription: PushSubscription }` | Token saved |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{ "token": "fcm-device-token-example", "platform": "android" }
```

---

### `DELETE /api/v1/push-subscriptions`

Remove a saved push token for the signed-in user.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | yes | Push token to remove. Legacy Expo tokens are accepted here for cleanup. |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Token removed if present |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

---

### `GET /api/v1/jobs/notifications`

Run the server-side reminder notification job. Production scheduling is handled by cron-job.org calling this endpoint every 30 minutes, which sends at most one relevant push per device per availability window.

**Auth:** `Authorization: Bearer <NOTIFICATIONS_JOB_SECRET>` (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `NotificationJobResult` | Job completed |
| 401 | `{ error: string }` | Missing or invalid bearer token |

**NotificationJobResult**

| Field | Type | Description |
|-------|------|-------------|
| checked | number | Saved subscriptions considered |
| sent | number | Push notifications accepted by FCM |
| skipped | number | Subscriptions with no due notification |
| failed | number | Push attempts that failed |
| invalidated | number | Invalid tokens removed after FCM rejected them |

**Notes**

- Reminder eligibility uses the same item, availability, timezone, and priority rules as `GET /api/v1/reminders`.
- A reminder notification is sent only when at least one of these exists, in this order: needs-attention must, getting-stale must, needs-attention want. Getting-stale wants do not notify.
- When a weekly support note is due (daytime in the user's timezone, and at least 6.5 days since the last weekly note or since the device was registered), that note is sent instead of an item reminder for that run. Copy stays qualitative: a quiet week, a few moments of care, or coming back more than once — never a score.
- Notifications defer to the user's next availability window when one is configured.
- At most one push is sent during each availability-window occurrence (for example a 17:00–19:00 window). Later job runs in that same window are skipped, including a different item.
- When no availability window is configured, repeats on the same device are throttled for 23 hours regardless of item.
- Re-saving the same device token does not clear notification history.
