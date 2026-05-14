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
- The agent connects to WiFi on boot and reports ready status to the backend
- The agent polls the backend on a fixed interval for commands
- The backend stores agents by ID, name, and network address

## Pending

- Backend endpoint to receive agent status reports (`POST /api/agent/{id}`)
- Agent polling loop fetches and executes commands (currently `delay` only)
- Backend-initiated command dispatch (currently impossible — no push path to agent)

## Constraints

| Constraint | Value | Location |
|------------|-------|----------|
| Frontend API base URL | `http://localhost:8080/api` | `RecipeContext.tsx`, `IngredientContext.tsx` |
| CORS allowed origin | `http://localhost:5173` | `Program.cs` |
| Agent API host | `localhost:8080` | `src/agent/src/config.h` |
| Agent transport | Plain HTTP (no TLS) | `api_client.h` — `WiFiClient` |
| Pump count | 4 | `pump_controller.h` |
| Agent ID | `1` (hardcoded) | `config.h` |
