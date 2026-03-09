# Repo Skills

Place repo-local reusable workflows in this directory.

Conventions:

- one skill per subdirectory
- each skill lives at `agents/skills/<skill-name>/SKILL.md`
- keep each skill focused on one repeatable workflow or decision area
- prefer concrete checklists and validation commands over long prose

Manager behavior:

- requirement planning discovers these skills and stores matched skill paths on planned tasks
- worker prompts reference matched skills so Codex can read them before editing
