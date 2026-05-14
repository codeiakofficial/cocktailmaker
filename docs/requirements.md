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
- The agent connects to the backend network on boot and reports ready status
- The backend can push a dispense command to a specific agent
- The backend stores agents by database ID, human-readable name, and AgentId
- AgentId is the MQTT topic identifier (e.g. `dispenser-1`), persisted in the DB so the backend knows which topics to subscribe to at startup

**Health monitoring** _(pending)_
- The user can see whether each agent is connected and responsive
- Connection loss is detected automatically without user action
- Health state is updated in near-real-time in the UI

## Pending

- MQTT broker on the Pi (Mosquitto) as event bus between backend and agents
- Agent subscribes to `cocktailmaker/agents/{id}/command` and executes dispense on message
- Agent publishes to `cocktailmaker/agents/{id}/status` with LWT = `offline`
- Backend subscribes to agent status topics and persists online/offline state
- Backend pushes agent status changes to the frontend via SSE
- `AgentController` backed by database (currently hardcoded in-memory)

## Constraints

| Constraint | Value | Location |
|------------|-------|----------|
| Network topology | Pi is WiFi access point; agents and Pi are on the same LAN | Infrastructure |
| Frontend API base URL | `http://localhost:8080/api` (hardcoded) | `RecipeContext.tsx`, `IngredientContext.tsx` |
| CORS allowed origin | `http://localhost:5173` (hardcoded) | `Program.cs` |
| Agent transport (current) | Plain HTTP via raw TCP | `api_client.h` |
| Agent transport (target) | MQTT over TCP :1883 | — |
| Pump count | 4 | `pump_controller.h` |
| Agent ID | `1` (hardcoded) | `config.h` |
| Multi-agent | Supported by MQTT topic structure; not a current priority | — |
