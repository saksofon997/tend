# Agent instructions

Tend is a calm life-maintenance app (web + Expo). Operate it as **prompt → branch → PR → CI → merge → deploy**. The human decides product questions only.

1. Follow [`.cursor/skills/tend-change-instructions/SKILL.md`](.cursor/skills/tend-change-instructions/SKILL.md) and [`.cursor/rules/`](.cursor/rules/).
2. Default to shipping; stop only for gates in [`.cursor/rules/autonomy.mdc`](.cursor/rules/autonomy.mdc).
3. Product and visual truth: [`PRODUCT.md`](PRODUCT.md), [`docs/design/`](docs/design/).
4. After UI: [`.cursor/skills/impeccable/SKILL.md`](.cursor/skills/impeccable/SKILL.md) (`adapt` then `polish`). Never `init` / `document`.
5. Loop and remaining dashboard setup: [`docs/autonomous-development.md`](docs/autonomous-development.md). GitHub `EXPO_TOKEN` and auto-merge: [`docs/github-setup.md`](docs/github-setup.md).

Do not run Superpowers brainstorming or plan-approval loops for ordinary implementation prompts.
