### `GET /api/v1/activity`

List recent tending events across all items for the signed-in user.

**Auth:** Session cookie (required)

**Query parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| limit | integer | no | Max events to return (1–100, default 50) |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ events: ActivityEntry[] }` | Recent events, newest first |
| 400 | `{ error: string }` | Invalid query |
| 401 | `{ error: string }` | Not signed in |

**ActivityEntry shape**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Event UUID |
| itemId | string | Parent item UUID |
| itemName | string | Item display name |
| tendedAt | ISO datetime | When the item was tended |
| createdAt | ISO datetime | When the event was logged |

---

### `PATCH /api/v1/activity/:eventId`

Correct a tended event date. Recomputes the parent item's `lastTendedAt` from the latest remaining event.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tendedAt | ISO datetime | yes | Corrected tended timestamp |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ item: Item, event: TendEvent }` | Updated |
| 400 | `{ error: string }` | Validation failure |
| 404 | `{ error: string }` | Event not found |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{ "tendedAt": "2026-06-13T12:00:00.000Z" }
```

---

### `DELETE /api/v1/activity/:eventId`

Remove a tended event. Recomputes the parent item's `lastTendedAt` from the latest remaining event, or `null` if none remain.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ item: Item }` | Deleted and item resynced |
| 404 | `{ error: string }` | Event not found |
| 401 | `{ error: string }` | Not signed in |

See [items.md](./items.md) for `Item` and `TendEvent` shapes.
