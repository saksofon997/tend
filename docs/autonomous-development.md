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

## What you still configure once

**Cursor Cloud environment** — you are already setting this up. Keep going there; it is not blocked on the items below.

**GitHub (do these now):** follow [`docs/github-setup.md`](github-setup.md) for `EXPO_TOKEN` and auto-merge. Short version:

1. Secret `EXPO_TOKEN` at [repo Actions secrets](https://github.com/saksofon997/tend/settings/secrets/actions) (create the token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)). Also add the same secret to the Cursor Cloud environment so agents can start a preview APK after a feature set.
2. [Allow auto-merge](https://github.com/saksofon997/tend/settings) + ruleset on `main` requiring status check `CI` with **0 approvals**.
3. Secret `AUTO_MERGE_TOKEN` (PAT with `repo` + `workflow`) so squash-merge can start CI and EAS Preview on `main`. Without it, GitHub ignores `GITHUB_TOKEN` merges.
4. Optional label `needs-product-decision` for the rare PRs you should see.

**Cursor Automations / Bugbot** — optional after GitHub merge works. CI is the merge gate; Bugbot is extra review, not a required approver.

**Play Store** — not automatic. Android preview APKs are the ship path. iOS is out of scope.

## How agents should behave

- Treat the prompt + `PRODUCT.md` + `docs/design/` as sufficient spec.
- Do not ask “does this approach look good?” for routine work.
- Ask once, with a recommendation, only for autonomy product gates.
- Open a PR. Do not wait for a human LGTM on implementation.
- After a feature set, start an EAS **preview APK** (`preview` profile), not a development client, and include the Expo build URL.
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
| Android preview APK | After a feature set, and on `main` when mobile paths change | EAS profile `preview` (internal). Agents with `EXPO_TOKEN` run `bunx eas-cli build --platform android --profile preview --non-interactive --no-wait` from `apps/mobile/`. Same profile as `.github/workflows/eas-preview.yml`. |
| Android development client | Only if explicitly asked | EAS profile `development` (`developmentClient: true`) |
| iOS | Out of scope | No bundle id, no CI, no store submit |
| Play Store production | Not automatic | Preview APKs are enough for testers |

OTA (`eas update`) is not configured; native preview builds are the ship path.

## Web deploy shape

Vercel builds `apps/web` with `vercel.json` (install from repo root, migrate, Next build). Merging to `main` is the production deploy. Preview deployments on PRs are useful for product-gate screenshots; they are not a second approval step for routine work.
