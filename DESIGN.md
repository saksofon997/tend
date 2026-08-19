# Design

Canonical Tend design lives in [`docs/design/`](docs/design/README.md). This file exists so design tools that look for a root `DESIGN.md` do not treat the app as greenfield or generate a second system.

| Source | Role |
|--------|------|
| [`PRODUCT.md`](PRODUCT.md) | Users, purpose, personality, anti-references (register: product) |
| [`docs/design/design-language.md`](docs/design/design-language.md) | Principles, type, color, motion, copy tone |
| [`docs/design/components.md`](docs/design/components.md) | Component catalog |
| [`docs/design/tokens.css`](docs/design/tokens.css) | CSS variables — single token source for web |

Visual personality: a quiet kitchen counter note — warm linen, clay, sage. Do not replace that palette. Agents finishing UI should load `.cursor/skills/impeccable/SKILL.md` and run `adapt` then `polish`.
