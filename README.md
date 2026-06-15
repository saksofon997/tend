# Tend

![CI](https://github.com/saksofon997/tend/actions/workflows/ci.yml/badge.svg)

A lightweight life-maintenance app for remembering recurring things that matter — without guilt-driven overdue tasks.

Tend tracks when you last tended household care, health upkeep, relationships, pets, vehicles, and life admin, and gently surfaces what could use attention now.

## Pre-alpha status

This repository is in **pre-alpha**: web-first, local Postgres, basic email/password accounts (no cloud sync, email verification, or password reset yet). See [MVP user stories](docs/mvp-user-stories.md) and the [development plan](docs/pre-alpha-development-plan.md).

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime / package manager | [Bun](https://bun.sh) |
| Language | TypeScript (strict) |
| Web app | Next.js 15 (App Router) + React 19 |
| UI | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL 16 |
| ORM | Drizzle |
| Auth (pre-alpha) | Lucia + bcrypt (local sessions) |
| Monorepo | Bun workspaces + Turborepo |
| Lint / format | Biome |

Mobile (Expo / React Native) is planned after the web pre-alpha proves useful; shared domain logic will live in `packages/domain`.

## Repository structure

```
apps/web/           Next.js UI and /api/v1 REST routes
packages/domain/    Status, rhythm, reminders, presets (pure TS)
packages/db/        Drizzle schema and migrations
docs/               Product specs, API reference, design system, development plan
```

**UI changes:** Read [`docs/design/README.md`](docs/design/README.md) first. Reuse components from `apps/web/components/`; see `.cursor/rules/ui-design.mdc`.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- [Docker](https://www.docker.com/) (for local Postgres)

## Getting started

### 1. Clone and install

```bash
git clone <repo-url> tend
cd tend
bun install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env — set SESSION_SECRET to a random 32+ byte string
```

### 3. Database

Start Postgres and apply migrations (migrate waits for the database to accept connections):

```bash
bun run setup:db
```

Or step by step:

```bash
docker compose up -d
bun run db:migrate
```

If migrate fails with "database system is starting up", wait a few seconds and run `bun run db:migrate` again — or use `setup:db` which retries automatically.

### 4. Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Health check: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start web app in development |
| `bun run build` | Production build |
| `bun run ci:check` | Full CI pipeline locally (lint → migrate → test → build) |
| `bun run test` | Run all tests |
| `bun run lint` | Lint and format check (Biome) |
| `bun run setup:db` | Start Postgres (Docker) and apply migrations |
| `bun run db:migrate` | Apply Drizzle migrations (waits for Postgres) |
| `bun run db:studio` | Open Drizzle Studio |

## Git hooks

After `bun install`, Husky runs the same checks as CI before each commit (`bun run ci:check`). Postgres must be running — start it with `bun run setup:db` or `docker compose up -d`.

To run the checks manually without committing:

```bash
bun run ci:check
```

## Manual QA

Before sharing with testers, walk through [`docs/manual-test-script.md`](docs/manual-test-script.md) — it covers all 14 MVP user stories.

## Deployment

Production hosting uses **Vercel** (app), **Neon** (Postgres), and **Cloudflare** (DNS). Step-by-step setup: [`docs/deployment.md`](docs/deployment.md).

## API documentation

HTTP endpoints are documented under [`docs/api/`](docs/api/README.md) as they are implemented. Base path: `/api/v1`.

## Product principles

- No strict due dates for wants
- No streaks or red “overdue” punishment
- Reminders create awareness, not pressure
- Setup fast enough to add an item in under a minute

## License

MIT — see [LICENSE](LICENSE).
