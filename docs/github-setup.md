# GitHub one-time setup (EXPO_TOKEN + auto-merge)

Cursor Cloud environment is separate — keep setting that up on its own. These two GitHub clicks close the merge and Android-preview loop. **iOS is out of scope.**

## 1. `EXPO_TOKEN` — GitHub Actions secret

Put it **only** here. Do not commit it, do not put it in `.env`, and do not add it to the Cursor Cloud environment (that environment does not trigger EAS).

1. Create a token: [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) → **Create token**. Copy it once.
2. Paste it: [github.com/saksofon997/tend/settings/secrets/actions](https://github.com/saksofon997/tend/settings/secrets/actions) → **New repository secret**.
3. Name (exact): `EXPO_TOKEN`
4. Value: the token from step 1 → **Add secret**

After that, pushes to `main` that touch `apps/mobile/**`, `packages/domain/**`, or `version.json` trigger an Android EAS **preview** APK (internal). Builds show up at [expo.dev/accounts/saksofon997/projects/tend/builds](https://expo.dev/accounts/saksofon997/projects/tend/builds).

To confirm without waiting for a mobile change: Actions → **EAS Preview** → **Run workflow**.

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

## Product-gate PRs

If a change hits an autonomy product gate, the agent should:

- open the PR as **draft**, and/or
- add the label `needs-product-decision`

Create that label once: [Issues → Labels](https://github.com/saksofon997/tend/labels) → **New label**, name `needs-product-decision`. Auto-merge skips it until you remove the label and mark the PR ready.
