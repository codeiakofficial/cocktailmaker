# General Instructions

- Ignore all other `*.md` unless explicitly referenced.
- Don't create files or functionality unless asked.
- Changes must be small and precise — no refactors, no speculative additions.
- After completing any change, the responsible agent must run its verification command and report the result.
- Before implementing, read `docs/architecture.md` and `docs/requirements.md`.
- Verify your change fits the documented communication patterns, data model, and requirements.
- If your change resolves a Known Mismatch, remove its row from the table in `docs/architecture.md`. If your change introduces a new mismatch, add a row.
- After completing a task, update `docs/architecture.md` and `docs/requirements.md`: remove resolved pending items, update constraints, adjust diagrams if flows changed.
- Always apply domain best practices (C#/.NET conventions, REST API design, Docker, architectural patterns, ESP32/embedded). If existing code deviates from best practice, report the mismatch to the user before proceeding — do not silently fix or silently ignore it.
- After any backend change, `dotnet test` must pass — including `ArchitectureTests` (conventions) and `DocumentationTests` (docs/architecture.md contract). A failing architecture or documentation test means code and docs disagree — fix the code or update the docs, never delete the test.

---

# Orchestrator

Routes tasks to the correct domain agent. Coordinates changes that span multiple agents. Does not implement changes directly.

**Decision rules**
- `src/backend/` or `tests/backend/` → Backend Agent
- `src/frontend/` → Frontend Agent
- `src/agent/` → ESP32 Agent
- `src/docker-compose.yml`, infrastructure → Backend Agent
- Cross-cutting → instruct each affected agent in sequence or in parallel where independent
- Frontend API calls belong in context files (e.g. `AgentContext`, `RecipeContext`), not in components

**When planning multi-step tasks, proactively suggest relevant Claude Code capabilities:**
- **Subagents** — spawn parallel agents when tasks are cross-codebase and independent (e.g. Backend + ESP32 sharing only an interface contract). Each subagent carries a cold-start cost — reserve for genuinely large or parallel work. Simple, single-file, or low-context tasks should be executed inline — subagents are not worth the overhead.
- **Plan mode** (`/plan`) — use before complex or cross-cutting changes to align on approach first
- **Worktrees** — isolate risky changes on a branch without affecting the working tree

---

# Workflow

Work proceeds in phases. Each phase must be fully verified before the next begins. Completed phases are removed from the roadmap — history is in git.

## PR Policy

All changes to `main` go through a pull request. Direct pushes are blocked by branch protection.

**Opening a PR:**
1. Create a branch from `main`
2. Add a task row to the roadmap table below (task ID, description, phase, status: In Progress)
3. Open the PR — title should match the task description

**Closing a PR:**
1. Remove the task row from the roadmap table as part of the PR
2. The roadmap table should be empty (or contain only other open PRs' tasks) when merging

**CI requirement:** Backend, Frontend, and ESP32 jobs must all pass before merge.

## Roadmap

| Task | Description | Phase | Status |
|------|-------------|-------|--------|
| T19 | PR workflow policy, conventional commits, GitVersion — automated semver releases on every merge to main | 8 — Workflow | In Progress |
| T20 | CI enforcement of branch naming (`feature/*`, `hotfix/*`) and conventional commit format (commitlint) | 9 — Convention Enforcement | Pending |
| T22 | Coverage reports — backend (coverlet) and frontend (v8) uploaded as CI artifacts | 9 — Quality | Pending |
| T24 | Agent responsibility restructure — split CI/Infrastructure agent from Backend Agent; define Review Agents | 9 — Convention Enforcement | Pending |
| T25 | README rewrite — remove stale TODOs, replace drawio.svg with Mermaid diagrams | 9 — Docs | Pending |

## Last Review

Update this table before merging each PR. Paste the command from the PR template as a comment on the PR to trigger the review.

| PR | Date | Summary |
|----|------|---------|
| #1 | 2026-05-15 | Initial: PR policy, GitVersion, conventional commits, review tracking, roadmap T22/T24/T25 |

---

# Agents

## Backend Agent

**Owns:** `src/backend/`, `tests/backend/`, `src/Dockerfile`, `src/docker-compose.yml`

**Run**
```
cd src
docker-compose -p cocktailmaker build && docker-compose -p cocktailmaker up
```

**Verify after changes**
```
cd tests/backend
dotnet test
```

All tests must pass before reporting the task complete.

---

## Frontend Agent

**Owns:** `src/frontend/`

**Run**
```
cd src/frontend
npm run dev
```

**Verify after changes**
```
cd src/frontend
npm test
```

All tests must pass before reporting the task complete.

---

## ESP32 Agent

**Owns:** `src/agent/`

**Build** (confirms firmware compiles for hardware)
```
cd src/agent
pio run -e esp32
```

**Verify after changes** (native unit tests, no device required)
```
cd src/agent
pio test -e test
```

All tests must pass before reporting the task complete. Do not flash to device unless explicitly asked.
