---
name: tend-change-instructions
description: Follow Tend project change instructions from .cursor before making code, test, documentation, web UI, mobile, linting, or API changes in this repository. Use for every implementation task in the Tend project, especially bug fixes, feature work, refactors, tests, documentation updates, apps/web UI work, apps/mobile work, and HTTP endpoint changes.
---

# Tend Change Instructions

Use this skill before making implementation changes in the Tend repository. The authoritative project instructions live in `.cursor/rules/`; read the applicable files directly and follow them as requirements.

## Required Workflow

1. Always read `.cursor/rules/implementation-workflow.mdc` before editing code.
2. Always read these baseline rules for implementation changes:
   - `.cursor/rules/code-documentation.mdc`
   - `.cursor/rules/testing.mdc`
   - `.cursor/rules/linting.mdc`
3. Read task-specific rules when they apply:
   - Web UI or user-facing copy: `.cursor/rules/ui-design.mdc`
   - Mobile changes under `apps/mobile/`: `.cursor/rules/mobile-development.mdc`
   - HTTP route/API behavior changes: `.cursor/rules/api-documentation.mdc`
4. Treat `.cursor/rules/*.mdc` as higher-priority project requirements for this repo. If a rule conflicts with the user request, explain the conflict and ask how to proceed.
5. In the final response, state which relevant verification commands ran and which `.cursor` rule areas applied. If a required step could not be run, state why.

## Practical Notes

- Bug fixes need a regression test unless impractical; document any exception.
- API behavior changes need `docs/api/` updates in the same change.
- Web UI/copy changes require reading `PRODUCT.md` and the relevant design docs named by the UI rule.
- Mobile changes require `bun run verify` from `apps/mobile/` before completion when feasible.
- Lint changed files before completion and fix all reported issues.
