### `GET /api/v1/items`

List the signed-in user's tend items with computed status.

**Auth:** Session cookie (required)

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| includeArchived | `"true"` \| `"false"` | Include archived items (default: false) |
| lifeArea | string | Filter by life area |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ items: Item[] }` | Items for the current user |
| 401 | `{ error: string }` | Not signed in |

---

### `POST /api/v1/items`

Create a tend item. If `lastTendedAt` is omitted, it defaults to now and an initial tend event is recorded.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Display name |
| type | `"must"` \| `"want"` | yes | Reminder strictness |
| rhythmDays | integer | yes | Target rhythm in days (1–365) |
| lifeArea | string | no | Life area enum value |
| lastTendedAt | ISO datetime | no | Defaults to now |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 201 | `{ item: Item }` | Created |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

---

### `GET /api/v1/items/:id`

Fetch one item and its recent tend events.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ item: Item, recentEvents: TendEvent[] }` | Found |
| 404 | `{ error: string }` | Not found |
| 401 | `{ error: string }` | Not signed in |

---

### `PATCH /api/v1/items/:id`

Update an item. Recomputes stored and returned status from rhythm and last tended date.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | no | Display name |
| type | `"must"` \| `"want"` | no | Reminder strictness |
| rhythmDays | integer | no | Target rhythm in days |
| lifeArea | string \| null | no | Life area |
| lastTendedAt | ISO datetime \| null | no | Correct last tended time |
| archived | boolean | no | `true` archives; `false` restores |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ item: Item }` | Updated |
| 400 | `{ error: string }` | Validation failure |
| 404 | `{ error: string }` | Not found |
| 401 | `{ error: string }` | Not signed in |

---

### `DELETE /api/v1/items/:id?confirm=true`

Permanently delete an item and its tend history.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Deleted |
| 400 | `{ error: string }` | Missing `confirm=true` |
| 404 | `{ error: string }` | Not found |
| 401 | `{ error: string }` | Not signed in |

---

### `POST /api/v1/items/:id/tend`

Mark an item as tended. Appends a tend event and updates `lastTendedAt`.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tendedAt | ISO datetime | no | Defaults to now |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ item: Item, event: TendEvent }` | Tended |
| 404 | `{ error: string }` | Not found |
| 401 | `{ error: string }` | Not signed in |

---

### `GET /api/v1/items/presets`

Starter suggestions from the domain catalog.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ presets: Preset[] }` | Preset list |
| 401 | `{ error: string }` | Not signed in |

---

### `Item`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Item id |
| name | string | Display name |
| type | `"must"` \| `"want"` | Reminder strictness |
| rhythmDays | integer | Target rhythm in days |
| lifeArea | string \| null | Optional life area |
| lastTendedAt | ISO datetime \| null | Last tended timestamp |
| status | `"fresh"` \| `"getting_stale"` \| `"needs_attention"` | Computed on read |
| daysSinceLastTended | integer \| null | Whole days since last tended |
| archivedAt | ISO datetime \| null | Archive timestamp |
| createdAt | ISO datetime | Created at |
| updatedAt | ISO datetime | Updated at |

### `TendEvent`

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Event id |
| itemId | string (uuid) | Parent item |
| tendedAt | ISO datetime | When the item was tended |
| createdAt | ISO datetime | Record created at |

### `Preset`

| Field | Type | Description |
|-------|------|-------------|
| name | string | Suggested item name |
| type | `"must"` \| `"want"` | Default type |
| rhythmDays | integer | Default rhythm |
| lifeArea | string | Default life area |
