### `GET /api/v1/availability`

List the signed-in user's weekly availability windows.

**Auth:** Session cookie (required)

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ windows: AvailabilityWindow[] }` | Current windows |
| 401 | `{ error: string }` | Not signed in |

---

### `PUT /api/v1/availability`

Replace all availability windows for the user. Sending an empty `windows` array clears availability.

**Auth:** Session cookie (required)

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| windows | `AvailabilityWindow[]` | yes | Full replacement set |

**AvailabilityWindow**

| Field | Type | Description |
|-------|------|-------------|
| dayOfWeek | integer | 0 (Sunday) through 6 (Saturday) |
| startTime | string | Start time in `HH:MM` (24-hour) |
| endTime | string | End time in `HH:MM` (24-hour), must be after start |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ windows: AvailabilityWindow[] }` | Saved windows |
| 400 | `{ error: string }` | Validation failure |
| 401 | `{ error: string }` | Not signed in |

**Example**

```json
{
  "windows": [
    { "dayOfWeek": 1, "startTime": "18:00", "endTime": "22:00" },
    { "dayOfWeek": 3, "startTime": "09:00", "endTime": "12:00" }
  ]
}
```

**Notes**

- Days without windows are treated as unavailable.
- Wants defer to availability windows; musts still surface for attention banners.
- Scheduled notifications defer to availability windows; musts still sort ahead of wants for notification titles.
