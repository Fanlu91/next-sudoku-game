# Agent Guide

This file is the execution entrypoint only.

Do not duplicate full project or product specification here. Keep detailed repo behavior in `agents/SPEC.md`.

Read these files before making changes:

1. `agents/SPEC.md`
2. `agents/checks.json`
3. `agents/progress.md`
4. relevant files under `agents/skills/`

Hard rules:

- Keep changes inside this repository only.
- Follow `agents/SPEC.md` as the canonical project specification.
- Treat `agents/checks.json` as the executable verification source of truth.
- Run required verification commands before concluding implementation work.
- Keep changes atomic and reviewable.
- Record major incidents and major spec/architecture changes in `agents/progress.md`.
- Do not invent behavior that is not supported by `agents/SPEC.md` or the codebase.

Delivery expectation:

- Report summary, changed files, verification results, and risk notes.
- If requirements are materially ambiguous, stop and ask concise blocking questions.
