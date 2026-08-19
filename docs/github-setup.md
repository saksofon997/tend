# GitHub one-time setup (EXPO_TOKEN + auto-merge)

Cursor Cloud environment is separate from GitHub Actions. Put `EXPO_TOKEN` in **both** so Cloud Agents can start a preview APK after a feature set, and so `eas-preview.yml` can run on `main`. **iOS is out of scope.**

## 1. `EXPO_TOKEN` — GitHub Actions and Cloud Agent

Do not commit the token and do not put it in `.env`. Put the same Expo access token in **both** places:

1. [GitHub Actions secrets](https://github.com/saksofon997/tend/settings/secrets/actions) as `EXPO_TOKEN` — used by [`.github/workflows/eas-preview.yml`](../.github/workflows/eas-preview.yml).
2. The Cursor Cloud environment as `EXPO_TOKEN` — used after a feature set so the agent can run `bunx eas-cli build --platform android --profile preview --non-interactive --no-wait` from `apps/mobile/`. GitHub secrets are not visible to Cloud Agents.

Create the token: [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) → **Create token**. Copy it once.

After that, Android **preview** APKs (internal, installable) show up at [expo.dev/accounts/saksofon997/projects/tend/builds](https://expo.dev/accounts/saksofon997/projects/tend/builds). Do not use EAS profile `development` unless asked.

To confirm from GitHub without waiting for a mobile change: Actions → **EAS Preview** → **Run workflow**.

## 2. Auto-merge — three GitHub settings + one workflow

The workflow [`.github/workflows/automerge.yml`](../.github/workflows/automerge.yml) calls `gh pr merge --auto --squash` on every non-draft PR into `main` that is not labeled `needs-product-decision`. GitHub will not expose that API until the repo allows auto-merge **and** `main` has at least one unmet merge requirement (a required check).

### A. Allow auto-merge

1. Open [repository Settings → General](https://github.com/saksofon997/tend/settings).
2. Scroll to **Pull Requests**.
3. Check **Allow auto-merge**.
4. Keep **Allow squash merging** on (the workflow squash-merges).

### B. Protect `main` with CI only — no human approval

Do **not** require pull request reviews. That would put you back in the loop for every change.

1. Open [Settings → Rules → Rulesets](https://github.com/saksofon997/tend/settings/rules).
2. **New ruleset** → **New branch ruleset**.
3. Name: `main`
4. Enforcement: **Active**
5. Target branches: **Add target** → **Include default branch** (or `main`)
6. Rules:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging**
     - Required approvals: **0**
     - Do not require review from Code Owners
   - **Require status checks to pass**
     - Check name (exact): `CI`
     - Optionally **Require branches to be up to date**
7. Save.

`CI` is the job name in `.github/workflows/ci.yml`. If the ruleset picker is empty, merge this branch first (or run CI once on `main`) so GitHub has seen the check, then add it.

### C. Do not require yourself

Leave **Require approvals** at 0. Product-only stops use the `needs-product-decision` label (agents leave those PRs as drafts). Everything else squash-merges when `CI` is green, then Vercel deploys web and EAS builds Android preview.

### D. `AUTO_MERGE_TOKEN` — so merge can trigger EAS and CI on `main`

GitHub does not start new Actions workflows from events created by `GITHUB_TOKEN`. Auto-merge therefore squash-merges without running **CI** or **EAS Preview** on `main`.

1. Create a GitHub PAT with permission to merge pull requests and trigger workflows (`repo` + `workflow` on a classic token).
2. Add it as a repository secret named `AUTO_MERGE_TOKEN` at [repo Actions secrets](https://github.com/saksofon997/tend/settings/secrets/actions).
3. Auto-merge already uses `AUTO_MERGE_TOKEN` when present, and falls back to `GITHUB_TOKEN`.

## Product-gate PRs

If a change hits an autonomy product gate, the agent should:

- open the PR as **draft**, and/or
- add the label `needs-product-decision`

Create that label once: [Issues → Labels](https://github.com/saksofon997/tend/labels) → **New label**, name `needs-product-decision`. Auto-merge skips it until you remove the label and mark the PR ready.
