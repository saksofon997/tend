# Deployment: Vercel + Neon + Cloudflare

Free-tier hosting for Tend pre-alpha:

| Service | Role |
|---------|------|
| [Neon](https://neon.tech) | Managed PostgreSQL |
| [Vercel](https://vercel.com) | Next.js app hosting |
| [Cloudflare](https://cloudflare.com) | DNS for your DigitalPlat domain |

Estimated cost: **$0/month** at pre-alpha traffic.

---

## Overview

```
DigitalPlat (registrar)
    └── nameservers → Cloudflare DNS
                            ├── CNAME → Vercel (app)
                            └── (optional) email records

Vercel (apps/web)
    └── DATABASE_URL → Neon Postgres (pooled)
    └── build runs db:migrate → Neon (unpooled)
```

---

## 1. Neon — PostgreSQL

1. Sign up at [console.neon.tech](https://console.neon.tech).
2. **New project** → name it `tend` → region closest to your users.
3. On the project dashboard, open **Connection details**.
4. Copy both connection strings:
   - **Pooled** (host contains `-pooler`) → use as `DATABASE_URL` on Vercel
   - **Direct / Unpooled** → use as `DATABASE_URL_UNPOOLED` on Vercel (migrations only)

Neon appends `?sslmode=require` — keep that in the URL.

### Apply migrations locally (first time)

```bash
# In your .env (or export inline):
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://.../neondb?sslmode=require

bun run db:migrate
```

Verify: open Neon **Tables** — you should see `users`, `sessions`, `items`, etc.

---

## 2. Vercel — Next.js app

### Connect the repo

1. Sign up at [vercel.com](https://vercel.com) (GitHub login is easiest).
2. **Add New → Project** → import your `tend` GitHub repo.
3. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | *(leave default — uses `vercel.json`)* |
| **Install Command** | *(leave default — uses `vercel.json`)* |

4. Enable **Include source files outside of the Root Directory in the Build Step** (required for the Bun monorepo workspace packages).

### Environment variables

In **Project → Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | Neon **pooled** connection string | Production, Preview, Development |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string | Production, Preview, Development |
| `SESSION_SECRET` | Random 32+ char secret (`openssl rand -base64 32`) | Production, Preview, Development |
| `NOTIFICATIONS_JOB_SECRET` | Random token for manually triggering the notification job endpoint | Production, Preview |
| `NODE_ENV` | `production` | Production only |

**Optional:** install the [Neon Vercel integration](https://vercel.com/integrations/neon) — it can inject `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.

### Deploy

Click **Deploy**. Each build runs `bun run db:migrate` then `next build`. Check the build log for `Migrations applied successfully`.

Smoke test:

```text
https://<your-project>.vercel.app/api/v1/health
```

Expect `"database": "ok"` when `DATABASE_URL` is set correctly.

### Server-side notification worker

Vercel's free tier does not include Cron Jobs. Reminder push notifications now run from a standalone Node worker using `node-cron`; deploy it anywhere that can keep a Bun/Node process running with the same `DATABASE_URL` as the web app.

Run from the repo root:

```bash
bun run notifications:worker
```

Optional worker env vars:

| Name | Default | Description |
|------|---------|-------------|
| `NOTIFICATIONS_JOB_CRON` | `*/30 * * * *` | Cron expression for the notification job |
| `NOTIFICATIONS_JOB_RUN_ON_START` | `false` | Set to `true` to run once when the worker boots |

The worker calls the notification job directly through the database; it does not need to hit `/api/v1/jobs/notifications`. Keep `NOTIFICATIONS_JOB_SECRET` configured only if you want the HTTP endpoint available as a protected manual/admin trigger.

### Custom domains (before Cloudflare)

In **Project → Settings → Domains**, add both hostnames:

| Domain | Purpose |
|--------|---------|
| `tend.qzz.io` | Marketing landing page and legal pages |
| `app.tend.qzz.io` | App, auth, and API |

Vercel shows the DNS records you need — you'll enter these in Cloudflare in step 3.

Optional env overrides (defaults match the table above):

| Name | Default |
|------|---------|
| `CANONICAL_APP_HOST` | `app.tend.qzz.io` |
| `MARKETING_HOST` | `tend.qzz.io` |

Middleware keeps marketing routes on `tend.qzz.io` (`/`, `/privacy`, `/terms`, promo assets) and sends everything else to `app.tend.qzz.io`. Landing CTAs link directly to the app host so sessions stay on one subdomain.

---

## 3. Cloudflare — DNS for DigitalPlat domain

### Move DNS to Cloudflare

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Add a site** → enter your domain → choose the **Free** plan.
3. Cloudflare shows two nameservers, e.g.:
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
4. In **DigitalPlat** → your domain → **Nameservers** → switch to custom and paste Cloudflare's pair.
5. Wait for propagation (often 15 minutes–24 hours). Cloudflare emails when active.

### Point domains to Vercel

In Cloudflare **DNS → Records** (zone `qzz.io`):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `tend` | `cname.vercel-dns.com` | DNS only (grey cloud) initially |
| CNAME | `app.tend` | `cname.vercel-dns.com` | DNS only |

That serves `tend.qzz.io` (landing + legal) and `app.tend.qzz.io` (app + auth) from the same Vercel project.

In Vercel **Domains**, add both hostnames. Vercel issues HTTPS automatically once DNS resolves.

### Block direct `.vercel.app` access

Middleware permanently redirects any `*.vercel.app` request to `https://app.tend.qzz.io` (same path and query string). Override with `CANONICAL_APP_HOST` / `MARKETING_HOST` in Vercel env vars if needed.

### Proxy (orange cloud) note

Start with **DNS only** (grey cloud) until the site works. You can enable Cloudflare proxy later for caching/DDoS protection. If you enable it, set SSL/TLS mode to **Full** in Cloudflare.

---

## 4. Post-deploy checklist

- [ ] `GET /api/v1/health` returns `"database": "ok"`
- [ ] Register a test account at `/register`
- [ ] Complete onboarding and add an item
- [ ] Run [`docs/manual-test-script.md`](manual-test-script.md) before sharing with testers

---

## Troubleshooting

### Build fails on `db:migrate`

- Confirm `DATABASE_URL_UNPOOLED` (or `DATABASE_URL`) is set in Vercel env vars.
- Run `bun run db:migrate` locally with the same URL to see the error.
- Neon free tier suspends inactive projects — open the Neon console to wake it.

### Health check: `"database": "not_configured"`

- `DATABASE_URL` is missing in Vercel environment variables.

### Health check: `"database": "error"`

- Wrong connection string, Neon project paused, or network issue.
- For pooled URLs, ensure the host contains `-pooler` and `sslmode=require` is present.

### Auth cookies not sticking

- Custom domain must match what users visit (www vs apex).
- `secure` cookies require HTTPS — works on Vercel automatically.

### Monorepo build: cannot find `@tend/db`

- Root Directory must be `apps/web`.
- Enable **Include source files outside of the Root Directory**.

---

## Local vs production env

See [`.env.example`](../.env.example). Local dev uses Docker Postgres; production uses Neon URLs from the Neon console.
