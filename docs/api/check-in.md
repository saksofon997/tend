# Check In

Quiet tending summary for the signed-in user, with a period filter. Derived from active items and tend events — not a separate analytics model.

### `GET /api/v1/check-in`

Return a Check In summary for the selected period.

**Auth:** Session cookie (required)

**Query parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| period | `"week"` \| `"month"` \| `"ninety"` \| `"all"` | no | History window. Default `"week"` |

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ period, summary }` | Summary for the requested period |
| 400 | `{ error: string }` | Unknown period |
| 401 | `{ error: string }` | Not signed in |

**`summary` fields**

| Field | Type | Description |
|-------|------|-------------|
| totalTends | number | Tend events in the period |
| tendedItemCount | number | Distinct items tended in the period |
| careDays | number | Distinct calendar days with at least one tend |
| activeItemCount | number | Current active items |
| sharedItemCount | number | Current shared items |
| mostTendedItem | `{ itemId, name, count }` \| null | Item tended most often in the period |
| mostTendedWith | `{ displayName, count }` \| null | Shared person tended with most often |
| mostTendedLifeArea | `{ lifeArea, count }` \| null | Life area tended most often |
| mostActiveWeekday | `{ weekday, count }` \| null | Weekday with the most tends (`0` = Sunday) |
| weekdayCounts | `{ weekday, count }[]` | Seven weekday buckets |
| attentionCounts | `{ fresh, gettingStale, needsAttention }` | Current item mix, not period-filtered |

**Notes**

- History fields respect `period`. `attentionCounts`, `activeItemCount`, and `sharedItemCount` describe the present.
- Counts are awareness, not scores. Clients must not present them as streaks.
- Extra query fields are ignored so older clients keep working.

**Example**

```json
{ "period": "week" }
```
