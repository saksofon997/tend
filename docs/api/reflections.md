# Reflections

One journal leaf per calendar day for the signed-in user. A day with no writing has no stored row.

### `GET /api/v1/reflections`

List written reflection leaves, newest day first.

**Auth:** Session cookie (required)

**Query parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| from | `YYYY-MM-DD` | no | Inclusive start calendar date |
| to | `YYYY-MM-DD` | no | Inclusive end calendar date |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ entries: Reflection[] }` | Written leaves, newest `entryDate` first |
| 400 | `{ error: string }` | Invalid query |
| 401 | `{ error: string }` | Not signed in |

**`Reflection` shape**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Leaf UUID |
| entryDate | `YYYY-MM-DD` | Calendar day this leaf belongs to |
| body | string | Journal text, up to 1000 characters |
| createdAt | ISO datetime | When the leaf was first written |
| updatedAt | ISO datetime | When the leaf was last saved |

`from` must be on or before `to` when both are set. Extra query fields are ignored so older clients keep working. Empty days are omitted — clients render a blank leaf locally.

---

### `GET /api/v1/reflections/:date`

Return the leaf for one calendar day, or `null` when that day is still blank.

**Auth:** Session cookie (required)

**Path**

| Field | Type | Description |
|-------|------|-------------|
| date | `YYYY-MM-DD` | Calendar day |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ entry: Reflection \| null }` | Written leaf, or `null` for a blank day |
| 400 | `{ error: string }` | Invalid calendar date |
| 401 | `{ error: string }` | Not signed in |

---

### `PUT /api/v1/reflections/:date`

Create or replace the leaf for a calendar day. A blank or whitespace-only body removes the stored leaf.

**Auth:** Session cookie (required)

**Path**

| Field | Type | Description |
|-------|------|-------------|
| date | `YYYY-MM-DD` | Calendar day |

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| body | string | yes | Journal text, 0–1000 characters |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ entry: Reflection \| null }` | Saved leaf, or `null` when the day was cleared |
| 400 | `{ error: string }` | Invalid date, JSON, or body length |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{ "body": "A quiet morning with the plants." }
```

---

### `DELETE /api/v1/reflections/:date`

Remove the stored leaf for a calendar day. Succeeds even if the day was already blank.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ ok: true }` | Leaf removed or already absent |
| 400 | `{ error: string }` | Invalid calendar date |
| 401 | `{ error: string }` | Not signed in |
