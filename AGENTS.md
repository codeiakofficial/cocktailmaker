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
- All new functionality must be test-driven: write a failing test first, verify the failure is for the right reason, then implement. Never commit an implementation without a prior failing test commit.
- PR descriptions must be short and precise: three sections only — Task (IDs + names), Changes (one bullet per change), Review (template block + checkboxes). No prose, no explanations. Update title and description immediately when scope changes — never leave them out of sync with the actual content. Omit any change introduced and removed within the same PR — it is zero net delta and is noise in the description.
- Never remove an existing user-facing feature, UI option, or behaviour unless explicitly instructed to do so. When a user reports "the old X shouldn't be available", confirm whether they mean a broken/unintended fallback state or the named feature before acting.
- Ubiquitous language: every domain concept has exactly one canonical name used identically across all files — TypeScript source, CSS classes, localStorage keys, variable names, test descriptions, and documentation. When a concept is renamed, every reference must be updated in the same PR. A mismatch between layers (e.g. a feature called "frost" in the UI but "vignette" in a CSS class or localStorage key) is a defect, not a cosmetic issue.
- The roadmap row for a task must be removed in the final commit of its PR — not deferred. A row with status "In Progress" must not remain once the task is complete; CI blocks merge if any such row is present.

---

# Orchestrator

Routes tasks to the correct domain agent. Coordinates changes that span multiple agents. Does not implement changes directly.

**Decision rules**
- `src/backend/` or `tests/backend/` → Backend Agent
- `src/frontend/` → Frontend Agent
- `src/agent/` → ESP32 Agent
- `src/docker-compose.yml`, `.github/`, infrastructure → CI/Infrastructure Agent
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
1. Remove the task row from the roadmap table in the **final commit of the PR** — not as a follow-up
2. The roadmap table should be empty (or contain only other open PRs' tasks) when merging
3. Merge is blocked by CI if any roadmap row with status "In Progress" remains

**CI requirement:** Backend, Frontend, and ESP32 jobs must all pass before merge.

## Roadmap

| Task | Description | Phase | Status |
|------|-------------|-------|--------|

## Last Review

Before merging, run a review in Claude Code: ask Claude to read `git diff main...HEAD` and evaluate against each scope defined in the Review Agents section. Summarise findings in one line and add a row here.

| PR | Date | Summary |
|----|------|---------|
| #1 | 2026-05-15 | Initial: PR policy, GitVersion, conventional commits, review tracking, roadmap T22/T24/T25, T20 lint job |
| #2 | 2026-05-15 | Rename CodeQL workflow; clean up merged tasks from roadmap |
| #3 | 2026-05-15 | T22–T25: coverage artifacts, agent restructure, README rewrite, review process, squash merge documented |
| #4 | 2026-05-17 | T27: fix page navigation re-fetch; clean, minimal; pre-existing quantity input type issue noted (out of scope) |
| #5 | 2026-05-17 | T21: commit-msg + pre-push hooks, fixed Frontend verify command; pre-push requires pio locally (acceptable) |
| #6 | 2026-05-23 | T28: Manage Agents page, pump mapping, ESP32 NVS config; NVS stores IDs only — names repopulated via retained MQTT on reconnect (acceptable) |
| #7 | 2026-05-24 | T29: mobile nav, settings tabs, appearance customisation, header blur; muted-hover picker + header toggle added to requirements; localStorage persistence documented in architecture |
| #8 | 2026-05-24 | T30/T31: background image picker + bg-center fix + recipe images; image upload API, Docker volume, Recipe.ImageUrl, EnsureSchema pattern documented |

---

# Agents

## Implementation Agents

Make changes. Each agent owns the files listed and verifies with the command shown.

### Backend Agent

**Owns:** `src/backend/`, `tests/backend/`

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

### Frontend Agent

**Owns:** `src/frontend/`

**Run**
```
cd src/frontend
npm run dev
```

**Verify after changes**
```
cd src/frontend
npm run build && npm test -- --run
```

All tests must pass before reporting the task complete.

---

### ESP32 Agent

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

---

### CI/Infrastructure Agent

**Owns:** `.github/`, `src/Dockerfile`, `src/docker-compose.yml`, `src/docker-compose.override.yml`, `GitVersion.yml`, `commitlint.config.js`

**Verify after changes**

CI jobs are the verification — push to a feature branch and confirm all GitHub Actions jobs pass. For YAML changes, validate locally with:
```
docker-compose -f src/docker-compose.yml config
```

---

## Review Agents

Analyse only — do not make changes. Run in Claude Code before merging:

```
Review this PR using the Review Agents in AGENTS.md. Read git diff main...HEAD and evaluate each scope in order.
```

Summarise findings in one line and add a row to the Last Review table above.

**All review agents apply these cross-cutting checks across their domain and, where relevant, across the entire solution:**

- **Dead code** — flag any exported symbol, public function, CSS class, localStorage key, or constant that is defined but never consumed outside its own test file. Dead code must be removed, not left inert.
- **Naming consistency (ubiquitous language)** — every concept must have exactly one name used identically across all layers it touches: TypeScript source, CSS selectors, localStorage keys, variable names, test descriptions, AGENTS.md, and documentation. Flag any mismatch regardless of how small — a feature renamed in one place but not another is a defect. Examples of past violations: feature called "frost" in the UI but "vignette" in CSS and localStorage; preset called "tropical" in UI but "light" in localStorage key and `restoreAppearance` branch.

### Architect Agent

Review scope: Does the change match documented patterns in `docs/architecture.md`? Are any Known Mismatches introduced or resolved? Verify that any renamed concepts are reflected consistently in the architecture documentation.

### Requirements Agent

Review scope: Does the change satisfy `docs/requirements.md`? Are there gaps or new implied requirements? Verify that terminology in requirements matches the names used in code and UI.

### Code Reviewer Agent

Review scope: C#/.NET, React/TypeScript, and C++ best practices. Prioritise code reduction. Flag non-idiomatic patterns. For every exported symbol and every module imported only in one place, verify it is actually called from app code — not just from its own tests. Dead exports (functions defined but never called, constants never read outside their file) must be flagged for removal. Apply the cross-cutting naming consistency check above across all frontend, backend, and ESP32 source files touched by the PR.

**CSS custom property reachability:** When a CSS custom property is set in every JS code path (e.g. by both `applyPresetColors` and `applyCustomColors`), verify that the app-config `:root` block in `index.css` contains no default for that property — it would be dead code that never takes effect. For every custom property touched in the diff, trace all JS write paths and confirm whether any CSS default remains reachable.

### Infrastructure Agent

Review scope: CI config correctness, GitVersion rules, branch naming (`feature/*`/`hotfix/*`), conventional commit compliance. PRs are squash-merged — the PR title becomes the single commit on `main` and is the only message GitVersion reads for version bumping; individual branch commit types are irrelevant. Verify the PR title type is correct (`feat:` → minor, `fix:` → patch, anything else → patch) and accurately reflects the full scope. Verify the PR description covers all changed tasks and contains no outdated or missing information. Apply the cross-cutting naming consistency check above to CI job names, environment variable names, secret names, and workflow file names.
