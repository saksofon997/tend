### `GET /api/v1/reminders`

Compute reminders for items that could use attention, using domain eligibility rules, the user's availability windows, and the user's saved timezone.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `RemindersResult` | Eligible reminders and availability metadata |
| 401 | `{ error: string }` | Not signed in |

**RemindersResult**

| Field | Type | Description |
|-------|------|-------------|
| reminders | `Reminder[]` | All eligible reminders (including deferred wants) |
| surfaceNow | `Reminder[]` | Reminders to show in the in-app banner now |
| nextWindowAt | ISO datetime \| null | Next availability window start when outside a window |
| inAvailabilityWindow | boolean | Whether the current time is inside a configured window |

**Reminder**

| Field | Type | Description |
|-------|------|-------------|
| itemId | string | Tend item id |
| name | string | Item display name |
| type | `"must"` \| `"want"` | Item type |
| status | `"getting_stale"` \| `"needs_attention"` | Computed status |
| daysSinceLastTended | integer \| null | Days since last tended |
| emphasis | `"strong"` \| `"normal"` | Visual emphasis (`strong` for musts) |
| visibility | `"now"` \| `"next_window"` | Whether to surface immediately |
| copy | string | Awareness-based reminder copy for UI |

**Example**

```json
{
  "reminders": [
    {
      "itemId": "…",
      "name": "Medication",
      "type": "must",
      "status": "needs_attention",
      "daysSinceLastTended": 11,
      "emphasis": "strong",
      "visibility": "now",
      "copy": "Medication is marked as a must and needs attention."
    }
  ],
  "surfaceNow": […],
  "nextWindowAt": null,
  "inAvailabilityWindow": true
}
```

**Notes**

- Fresh items are excluded.
- Musts needing attention always have `visibility: "now"`.
- Wants outside availability windows have `visibility: "next_window"` and are omitted from `surfaceNow`.
- When no availability is configured, wants surface like musts (no deferral).
- Availability is evaluated in the timezone saved through [settings.md](./settings.md).
