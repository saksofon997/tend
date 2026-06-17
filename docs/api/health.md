### `GET /api/v1/health`

Liveness and database connectivity check.

**Auth:** None

**Responses**

| Status | Body | Description |
|--------|------|-------------|
| 200 | `{ "status": "ok", "database": "connected", "version": string }` | App and Postgres are reachable |
| 503 | `{ "status": "error", "database": "not_configured", "error": string, "version": string }` | `DATABASE_URL` is missing |
| 503 | `{ "status": "error", "database": "disconnected", "error": string, "version": string }` | Postgres unreachable |

**Example**

```json
{ "status": "ok", "database": "connected", "version": "0.1.0" }
```
