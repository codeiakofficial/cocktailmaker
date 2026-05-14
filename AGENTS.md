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

## Roadmap

| Task | Description | Phase | Status |
|------|-------------|-------|--------|
| T10 | Frontend tests: dispense button disabled when no agent online; enabled and calls `dispense` when agent is online | 4 — Cleanup | Pending |
| T11 | CI: fix dotnet version (8 → 10), confirm backend build + test job passes | 5 — Pipeline | Pending |
| T12 | CI: add frontend job — `npm ci`, `npm run build`, `npm test` | 5 — Pipeline | Pending |
| T13 | CI: add ESP32 job — `pio run -e esp32` (build only, no flash) and `pio test -e test` | 5 — Pipeline | Pending |
| T14 | Serve frontend static build (`npm run build`) from backend Docker image via `wwwroot` | 6 — Release | Pending |
| T15 | Backend release config: disable dev seed data and Scalar UI in non-Development environments | 6 — Release | Pending |
| T16 | Agent release config: WiFi credentials, MQTT host, and API host read from a `config_local.h` excluded from git | 6 — Release | Pending |
| T17 | Pipeline release job: build Docker image, tag with git SHA, push to registry | 6 — Release | Pending |
| T18 | Integration test suite covering full stack: backend health, MQTT publish → agent status flip, dispense endpoint → MQTT command published | 7 — Verification | Pending |

**T11, T12, T13 can run in parallel** — independent CI jobs, no shared state.
**T14, T15, T16 can run in parallel** — different codebases. T17 depends on all three.

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
