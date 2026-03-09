# Repository Specification

Last Updated: 2026-03-09

## 1. Objective

- Project purpose: Tighten the auto-solve helper sentence
- Key user/business outcome: satisfy the active requirement for `next-sudoku-game-contract-sync-20260309-1159`.
- Non-goals: avoid unrelated rewrites and unplanned behavior changes.

## 2. Code Structure

- Repository root overview: .eslintrc.json, .gitignore, .npmrc, AGENTS.md, README.md, agents, app, components, docs, lib, next.config.js, nextjs-dashboard
- Key modules/packages: inspect the codebase before changing behavior.
- Critical data or control flow: follow existing entrypoints and tests before modifying stateful logic.

## 3. Build and Run Commands

- Install: use the repository's existing package/dependency manager; for npm/pnpm in this environment prefer the repo-local `.npmrc` mirror (`registry=https://registry.npmmirror.com`).
- Build: only when required by the repo or requested by checks.
- Run: prefer the existing development entrypoint documented in this repo.

## 4. Verification Commands

- Required checks: (declared in agents/checks.json or fallback pending)
- Optional checks: (none)
- Fast smoke checks: use targeted verification when the full suite is unnecessary.

## 5. Forbidden Paths and Safety Boundaries

- Paths that must not be changed: `.git/`, `.worktrees/`, generated secrets, external workspace roots.
- Files that require explicit human review: repo contract files when they materially change project behavior.
- Environment/secret handling constraints: secrets come from env vars only.

## 6. Delivery Rules

- Branch/PR expectations: manager selects direct-main vs PR path per task.
- Definition of done for this repo: changes land on the base branch with required verification complete.
- Required output/report format: summary, changed files, verification results, and risks.

## 7. Repo-Specific Constraints

- Architecture invariants: prefer minimal diffs and preserve current module boundaries unless the requirement says otherwise.
- Dependency/tooling constraints: keep the repo-local `.npmrc` registry aligned with `https://registry.npmmirror.com` unless the repo explicitly requires a different registry. Equivalent user-level commands: `npm config set registry https://registry.npmmirror.com` and `pnpm config set registry https://registry.npmmirror.com`.
- Performance/security constraints: avoid unbounded background work and avoid leaking credentials.

## 8. Known Gaps and Follow-Ups

- Active requirement context: On the game page, update the helper sentence near the Auto Solve control so it says: "Auto Solve fills one cell every 2 seconds."
Keep layout and behavior unchanged.
Do not change solver logic, replay behavior, or any backend API.
- Planned improvements: keep this spec synchronized with architecture-changing work.
