# Requirements

Derived from current implementation. Pending items are intended but not yet built.

## Functional

**Recipes**
- Users create, read, update, and delete recipes
- A recipe has a name and an ordered list of ingredients with quantity and unit
- Ingredients are tracked globally and reference the recipes they appear in

**Dispensing**
- The ESP32 agent controls up to 8 pumps (GPIO 16–19, 21–25, indices 0–7)
- A pump runs for a given duration in milliseconds, then stops
- Emergency stop halts all pumps immediately regardless of state
- Dispense uses the pump-ingredient mapping stored in NVS to route each recipe ingredient to the correct pump
- If no NVS config exists (first boot), dispense falls back to positional assignment (ingredient 0 → pump 0, etc.)

**Agent lifecycle**
- The agent connects to the broker on boot, sets a LWT, and publishes online status
- The backend subscribes to agent status topics and logs received events
- The backend stores agents by database ID, human-readable name, and AgentId
- AgentId is the MQTT topic identifier (e.g. `dispenser-1`), persisted in the DB so the backend knows which topics to subscribe to at startup
- The backend pushes a dispense command to a specific agent via MQTT

**Agent management**
- The user can rename an agent's display name
- The user can assign an ingredient to each pump slot (pump index 0–7)
- Pump-to-ingredient mappings are persisted in the backend DB as a JSON blob on the Agent entity
- When mappings are saved, the backend publishes the config as a retained MQTT message to `cocktailmaker/agents/{agentId}/config`
- The ESP32 subscribes to its config topic on boot and writes each slot to NVS (`Preferences`, namespace `"pump"`, key `"pump_N"`); NVS persists ingredient IDs only — ingredient names are restored when the broker delivers the retained config message on reconnect
- Config changes are reflected on the agent without reboot (config topic subscription is always active)

**Health monitoring**
- The user can see whether each agent is connected and responsive
- Connection loss is detected automatically without user action
- Health state is updated in near-real-time in the UI via SSE stream

**Navigation & Settings**
- On mobile, a fixed bottom tab bar provides access to Home, Ingredients, Agents, and Settings
- On desktop, the same pages are reachable from the top navigation bar
- The user can switch between Dark, Light, and Custom appearance modes
- Dark mode applies the default dark palette; Light mode applies a fixed tropical warm palette
- Custom mode enables per-variable colour pickers: button colour, button hover, background, font colour, muted text, title colour, border
- Changing any colour picker automatically activates Custom mode
- The user can select a typeface from 9 options; font selection is independent of the appearance mode
- Colour pickers are disabled unless Custom mode is active

## Constraints

| Constraint | Value | Location |
|------------|-------|----------|
| Network topology | Pi is WiFi access point; agents and Pi are on the same LAN | Infrastructure |
| MQTT broker | `eclipse-mosquitto:2`, port 1883, anonymous auth | `src/docker-compose.yml`, `src/mosquitto/mosquitto.conf` |
| Frontend API base URL | `http://localhost:8080/api` | `src/frontend/src/config.ts` |
| API route convention | Plural nouns — `api/recipes`, `api/ingredients`, `api/agents` | All controllers (explicit `[Route]` attribute) |
| CORS allowed origin | `http://localhost:5173` (hardcoded) | `Program.cs` |
| Agent transport (status) | MQTT via `PubSubClient` — LWT + retained publish | `src/agent/src/mqtt_client.h` |
| Agent transport (recipe fetch) | Plain HTTP via raw TCP | `src/agent/src/api_client.h` |
| Pump count | 8 (GPIO 16–19, 21–25) | `src/agent/src/pump_controller.h` |
| MQTT Agent ID | `dispenser-1` (hardcoded) | `src/agent/src/config.h` |
| Multi-agent | Supported by MQTT topic structure; not a current priority | — |
| CI | GitHub Actions: backend (dotnet test), frontend (vitest), ESP32 (pio test); test reports via dorny/test-reporter | `.github/workflows/ci.yml` |
| Versioning | GitVersion `GitHubFlow/v1`; conventional commits drive bump; every merge to `main` publishes an image and creates a GitHub release | `GitVersion.yml`, `.github/workflows/ci.yml` |
| Branch naming | All PR branches must use `feature/<description>` (new work) or `hotfix/<description>` (urgent fixes) | Convention — enforced by policy |
| Commit messages | Conventional commits required: `feat:` minor bump, `fix:` patch bump, `BREAKING CHANGE` major bump; other types (`chore:`, `docs:`, `ci:`, etc.) default to patch | `GitVersion.yml` |
| Merge strategy | All PRs are squash-merged; the PR title becomes the single commit on `main` and is the only message GitVersion reads for version bumping — individual branch commits are irrelevant | GitHub repo setting |
| PR policy | Every change to `main` goes through a PR; roadmap row added at PR open, removed at merge; all CI jobs must pass | `AGENTS.md`, branch protection |
