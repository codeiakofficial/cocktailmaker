# General Instructions

- Ignore all other `*.md` unless explicitly referenced.
- Don't create files or functionality unless asked.
- Changes must be small and precise — no refactors, no speculative additions.
- After completing any change, the responsible agent must run its verification command and report the result.
- Before implementing, read `docs/architecture.md` and `docs/requirements.md`.
- Verify your change fits the documented communication patterns, data model, and requirements.
- If your change resolves a Known Mismatch, remove its row from the table in `docs/architecture.md`. If your change introduces a new mismatch, add a row.
- After completing a task, update `docs/architecture.md` and `docs/requirements.md` to reflect any changes to data models, endpoints, flows, constraints, or pending items.

---

# Orchestrator

Routes tasks to the correct domain agent. Coordinates changes that span multiple agents.
Does not implement changes directly.
Token efficiency: Before spawning subagents, assess complexity.
Simple, single-file, or low-context tasks should be executed directly by the user or inline — subagents carry a cold-start cost.
Reserve parallel subagents for tasks that are genuinely independent, cross-codebase, and too large to hold in one context window.

**Decision rules**
- `src/backend/` or `tests/backend/` → Backend Agent
- `src/frontend/` → Frontend Agent
- `src/agent/` → ESP32 Agent
- `src/docker-compose.yml`, infrastructure → Backend Agent
- Cross-cutting → instruct each affected agent in sequence or in parallel where independent

**When planning multi-step tasks, proactively suggest relevant Claude Code capabilities:**
- **Subagents** — spawn parallel agents (Backend + ESP32) when tasks touch different codebases with a shared interface contract
- **Plan mode** (`/plan`) — use before implementing complex or cross-cutting changes to align on approach first
- **Worktrees** — isolate risky changes on a branch without affecting the working tree

---

# Workflow

## Phase-gated delivery

Work proceeds in phases. Each phase must be fully verified before the next begins. The Orchestrator confirms phase completion with the user before instructing the next phase.

## Current roadmap

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 — MQTT foundation | T1 Mosquitto ✓, T2 Backend MQTT client, T3 ESP32 MQTT client | T2 + T3 next (parallel) |
| 2 — Monitoring | T4 DB status, T5 SSE endpoint, T6 Frontend health UI | Pending |
| 3 — Dispense | T7 Backend dispense endpoint, T8 ESP32 command handler | Pending |

**T2 and T3 (Phase 1) can run in parallel** — different codebases, shared interface: MQTT topic names and payload shape.  
**T7 and T8 (Phase 3) can run in parallel** — same reason.

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
