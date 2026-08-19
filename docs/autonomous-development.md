# Autonomous development

Goal: type a prompt, get a branch and PR, pass review, merge, and deploy — without approving implementation details. You only decide **product** questions (see `.cursor/rules/autonomy.mdc`).

```text
prompt → cloud agent branch → implement + tests + lint
      → UI adapt/polish (if UI) → pull request
      → GitHub CI (+ optional Bugbot)
      → merge to main
      → Vercel (web) + EAS preview (Android)
```

## What already runs in the repo

| Stage | Status |
|-------|--------|
| Agent rules | `.cursor/rules/` + change-instructions skill |
| UI finish | Vendored `.cursor/skills/impeccable/` (Tend-constrained `adapt` + `polish`) |
| Product gates | `.cursor/rules/autonomy.mdc` |
| Verify on PR | `.github/workflows/ci.yml` → `bun run ci:check` |
| Web deploy | Vercel production from `main` (`apps/web`) |
| Mobile preview | `.github/workflows/eas-preview.yml` — Android `preview` profile on `main` when mobile-related paths change |

## What you still configure once (dashboard)

These cannot live as code. Until they are on, the loop pauses after the PR.

1. **Cursor Cloud environment** — This repo had no linked environment when audited. Save an environment with Bun, `bun install --frozen-lockfile`, and Docker Compose Postgres so agents can run `ci:check`. A committed [`.cursor/environment.json`](../.cursor/environment.json) is the repo-managed starting point.
2. **Cursor Automations** — Prompt (or Slack/Linear) → Cloud Agent on this repo, branch from `main`.
3. **Bugbot (or equivalent PR review)** — Enable on GitHub PRs so review is automatic. CI is the hard gate; Bugbot is the design/logic reviewer.
4. **GitHub auto-merge** — On the repo: allow auto-merge, protect `main`, require `CI` (and Bugbot if you want it required). Then PRs merge when checks go green unless a product-gate review is requested.
5. **`EXPO_TOKEN`** — GitHub Actions secret (Expo access token) so EAS preview builds actually trigger. Create at [expo.dev programmatic access](https://docs.expo.dev/accounts/programmatic-access/).
6. **Store submission** — App Store / Play remain a product decision. Preview APKs are enough for testers: [Expo builds](https://expo.dev/accounts/saksofon997/projects/tend/builds).

## How agents should behave

- Treat the prompt + `PRODUCT.md` + `docs/design/` as sufficient spec.
- Do not ask “does this approach look good?” for routine work.
- Ask once, with a recommendation, only for autonomy product gates.
- Open a PR. Do not wait for a human LGTM on implementation.
- Do not run impeccable `init` (would fight existing `PRODUCT.md` / `docs/design/`).
- Do not follow generic “avoid cream/linen backgrounds” guidance; that *is* Tend.

## Impeccable

Rules used to say “load the impeccable skill” without shipping it. Cloud agents then skipped polish or treated the app as a greenfield brand.

The vendored skill:

- Maps `adapt` / `polish` onto Tend tokens and components
- Applies to **web and Expo**, not only `apps/web/`
- Forbids `init`, `document`, `bolder`, and `overdrive`
- Points design tools at `DESIGN.md` → `docs/design/`

If you later install the pbakaus plugin locally, the Tend skill still wins.

## Mobile deploy shape

| Channel | When | How |
|---------|------|-----|
| Android preview APK | Push to `main` touching `apps/mobile/**`, `packages/domain/**`, or `version.json` | EAS profile `preview` (internal) |
| iOS | Not automatic | Missing `ios.bundleIdentifier` in `app.config.js`; needs Apple credentials — product/setup decision |
| Production store | Not automatic | EAS `production` profile exists; submitting is a product decision |

OTA (`eas update`) is not configured; native preview builds are the ship path.

## Web deploy shape

Vercel builds `apps/web` with `vercel.json` (install from repo root, migrate, Next build). Merging to `main` is the production deploy. Preview deployments on PRs are useful for product-gate screenshots; they are not a second approval step for routine work.
