# Tend HTTP API

Reference for exposed HTTP endpoints. Update this index and the linked resource docs whenever routes are added or changed.

> Agents: follow `.cursor/rules/api-documentation.mdc` when implementing endpoints.

## Conventions

- Base path: `/api/v1` (adjust when the app is scaffolded)
- JSON request and response bodies unless noted otherwise
- Errors: `{ "error": "<message>" }` with an appropriate HTTP status
- Auth: document per endpoint once auth is implemented

## Resources

| Resource | Doc | Description |
|----------|-----|-------------|
| Health | [health.md](./health.md) | Liveness and database connectivity |
| Auth | [auth.md](./auth.md) | Local account registration and sessions |
| Items | [items.md](./items.md) | Tend item CRUD, tend events, presets |
| Activity | [activity.md](./activity.md) | Correct or remove tended events |
| Availability | [availability.md](./availability.md) | Weekly free-time windows |
| Reminders | [reminders.md](./reminders.md) | In-app reminder eligibility |
| Notifications | [notifications.md](./notifications.md) | Push subscriptions and server-side notification job |
| Settings | [settings.md](./settings.md) | User preferences such as timezone |
| Onboarding | [onboarding.md](./onboarding.md) | First-run setup status |

## Changelog

| Date | Change |
|------|--------|
| 2026-06-25 | Switched server-side notification sends from Expo Push to FCM native device tokens |
| 2026-06-25 | Removed the standalone notification worker; scheduling is handled by cron-job.org hitting the HTTP job endpoint |
| 2026-06-19 | Added push subscription endpoints and 30-minute server-side notification job |
| 2026-06-17 | Added user settings endpoint for timezone-aware reminders |
| 2026-06-17 | Health responses include API `version`; footer shows app and API versions |
| 2026-06-15 | Added availability and reminders endpoints |
| 2026-06-15 | Added `GET /api/v1/activity` |
| 2026-06-15 | Added activity endpoints (correct/remove tend events) |
| 2026-06-15 | Added onboarding endpoints |
| 2026-06-15 | Added items endpoints (CRUD, tend, presets) |
| 2026-06-15 | Added auth endpoints (`register`, `login`, `logout`, `me`) |
| 2026-06-15 | Added `GET /api/v1/health` |
| — | API docs scaffold created |
