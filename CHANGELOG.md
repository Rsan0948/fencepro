# Changelog

All notable changes to FencePro are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Apache 2.0 license, NOTICE, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY.
- ESLint 9 (flat config) + Prettier toolchain.
- Vitest + React Testing Library scaffolding.
- GitHub Actions CI: lint, typecheck, test, build on push and PR.
- Pre-commit hooks (ESLint + Prettier + `tsc --noEmit`).
- `docs/architecture.md` + `docs/integrations/{stripe,email}.md` skeletons.
- HelicOps MCP integration for guarded source writes during development.

### Changed
- README rewritten with badges, Highlights, Architecture pointer, Quick Start.

### Notes
- Single-file `src/App.tsx` baseline preserved from initial commit; structural
  refactor lands in Lane 2.
