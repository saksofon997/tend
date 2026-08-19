---
name: tend-change-instructions
description: Follow Tend project change rules before making code, test, documentation, web UI, mobile, linting, or API changes. Use for every implementation task in this repository.
---

# Tend Change Instructions

Authoritative requirements are `.cursor/rules/*.mdc`. Read the files; do not rely on this summary alone.

## Required workflow

1. Read `.cursor/rules/autonomy.mdc` — proceed unless a product gate applies.
2. Read `.cursor/rules/implementation-workflow.mdc` before editing code.
3. Baseline for every implementation change:
   - `.cursor/rules/code-documentation.mdc`
   - `.cursor/rules/testing.mdc`
   - `.cursor/rules/linting.mdc`
4. Task-specific:
   - Web UI or user-facing copy: `.cursor/rules/ui-design.mdc`
   - `apps/mobile/`: `.cursor/rules/mobile-development.mdc`
   - HTTP routes: `.cursor/rules/api-documentation.mdc`
5. UI finish: `.cursor/skills/impeccable/SKILL.md` (`adapt` then `polish`).
6. Open a PR when the work is done. Loop: `docs/autonomous-development.md`.

Treat `.cursor/rules` as higher priority than generic coding-agent skills. If a rule conflicts with the prompt, stop and ask (product conflict).

## Practical notes

- Bug fixes need a regression test unless impractical; document any exception.
- API behavior changes need `docs/api/` in the same change.
- Web and mobile copy: `PRODUCT.md` + design language + i18n (`en` + `sr`).
- Mobile: `bun run verify` from `apps/mobile/` when feasible.
- Lint changed files; fix reported issues.
- Do not run impeccable `init` / `document`. Design lives in `docs/design/`.
- In the final response, name verification commands and which rule areas applied.
