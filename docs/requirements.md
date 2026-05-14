# Requirements

Derived from current implementation. Pending items are intended but not yet built.

## Functional

**Recipes**
- Users create, read, update, and delete recipes
- A recipe has a name and an ordered list of ingredients with quantity and unit
- Ingredients are tracked globally and reference the recipes they appear in

**Dispensing**
- The ESP32 agent controls 4 pumps (GPIO 16–19, indices 0–3)
- A pump runs for a given duration in milliseconds, then stops
- Emergency stop halts all pumps immediately regardless of state

**Agent lifecycle**
- The agent connects to the broker on boot, sets a LWT, and publishes online status
- The backend subscribes to agent status topics and logs received events
- The backend stores agents by database ID, human-readable name, and AgentId
- AgentId is the MQTT topic identifier (e.g. `dispenser-1`), persisted in the DB so the backend knows which topics to subscribe to at startup
- The backend pushes a dispense command to a specific agent via MQTT

**Health monitoring**
- The user can see whether each agent is connected and responsive
- Connection loss is detected automatically without user action
- Health state is updated in near-real-time in the UI via SSE stream

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
| Pump count | 4 | `src/agent/src/pump_controller.h` |
| MQTT Agent ID | `dispenser-1` (hardcoded) | `src/agent/src/config.h` |
| Multi-agent | Supported by MQTT topic structure; not a current priority | — |
| CI | GitHub Actions: backend (dotnet test), frontend (vitest), ESP32 (pio test); test reports via dorny/test-reporter | `.github/workflows/ci.yml` |
