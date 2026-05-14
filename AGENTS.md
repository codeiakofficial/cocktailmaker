# General Instructions

- Ignore all other `*.md` unless explicitly referenced.
- Don't create files or functionality unless asked.
- Changes must be small and precise — no refactors, no speculative additions.
- After completing any change, the responsible agent must run its verification command and report the result.
- Before implementing, read `docs/architecture.md` and `docs/requirements.md`.
- Verify your change fits the documented communication patterns, data model, and requirements.
- If your change touches an item in the **Known Mismatches** table, fix the mismatch rather than building on top of it. If you introduce a new mismatch, add it to the table.

---

# Agents

## Orchestrator

Routes tasks to the correct domain agent. Coordinates changes that span multiple agents (e.g. an API contract change requires both Backend and Frontend agents). Does not implement changes directly.

**Decision rules**
- `src/backend/` or `tests/backend/` → Backend Agent
- `src/frontend/` → Frontend Agent
- `src/agent/` → ESP32 Agent
- Cross-cutting → instruct each affected agent in sequence

---

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
