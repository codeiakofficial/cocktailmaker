# Architecture

## System Context

```mermaid
C4Context
    Person(user, "User", "Manages recipes and monitors agents via browser")
    System(cms, "CocktailMaker", "Recipe management and drink dispensing")
    System_Ext(hw, "ESP32 + Pumps", "Physical dispensing hardware")

    Rel(user, cms, "Uses", "HTTP")
    Rel(cms, hw, "Commands / status", "MQTT")
```

## Containers

```mermaid
C4Container
    Person(user, "User")

    Container(frontend, "Frontend", "React / TypeScript", "Recipe UI, agent management, appearance settings — port 5173")
    Container(backend, "Backend", "ASP.NET Core", "REST API + MQTT client — port 8080")
    Container(broker, "MQTT Broker", "Mosquitto", "Event bus — port 1883, runs on Pi")
    ContainerDb(db, "Database", "SQLite", "Recipes, ingredients, agents")
    Container(agent, "ESP32 Agent", "C++ / PubSubClient", "Pump controller")

    Rel(user, frontend, "Uses", "HTTP :5173")
    Rel(frontend, backend, "CRUD + SSE", "HTTP :8080")
    Rel(backend, db, "Read / Write", "EF Core")
    Rel(backend, broker, "Publish commands / Subscribe status + config", "MQTT :1883")
    Rel(agent, broker, "Subscribe commands + config / Publish status + LWT", "MQTT :1883")
```

> **Network:** Pi is the WiFi access point. Frontend, backend, broker, and all agents share the same LAN. No internet dependency.

---

## Communication Flows

### Recipe CRUD (Frontend → Backend)

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant SQLite

    Browser->>Backend: GET /api/recipes
    Backend->>SQLite: SELECT
    SQLite-->>Backend: rows
    Backend-->>Browser: Recipe[]

    Browser->>Backend: POST /api/recipes
    Backend->>SQLite: INSERT recipe (ingredients as JSON blob)
    Backend->>SQLite: UPSERT Ingredient rows + update UsedInRecipes
    Backend-->>Browser: 201 Created

    Browser->>Backend: PUT /api/recipes/{id}
    Backend->>SQLite: UPDATE recipe + re-sync Ingredient.UsedInRecipes
    Backend-->>Browser: 204

    Browser->>Backend: DELETE /api/recipes/{id}
    Backend->>SQLite: DELETE recipe + remove recipeId from UsedInRecipes
    Backend-->>Browser: 204
```

### Ingredient CRUD (Frontend → Backend)

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant SQLite

    Browser->>Backend: GET /api/ingredients
    Backend->>SQLite: SELECT
    SQLite-->>Backend: rows
    Backend-->>Browser: Ingredient[]

    Browser->>Backend: POST /api/ingredients
    Backend->>SQLite: INSERT ingredient
    Backend-->>Browser: 201 Created

    Browser->>Backend: PUT /api/ingredients/{id}
    Backend->>SQLite: UPDATE ingredient.Name
    Backend-->>Browser: 204

    Browser->>Backend: DELETE /api/ingredients/{id}
    Backend->>SQLite: DELETE ingredient
    Backend-->>Browser: 204
```

### Dispense command

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant Broker as Mosquitto
    participant ESP32

    Browser->>Backend: POST /api/agents/{id}/dispense {"recipeId": id}
    Backend->>Broker: PUBLISH cocktailmaker/agents/{agentId}/command {"recipeId": id}
    Broker-->>ESP32: {"recipeId": id}
    ESP32->>Backend: GET /api/recipes/{recipeId}
    Backend-->>ESP32: Recipe + ingredients [{name, quantity, unit}]
    ESP32->>ESP32: look up pump index per ingredient name (NVS pump map)
    ESP32->>ESP32: dispense pumps
```

### Agent pump configuration

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant SQLite
    participant Broker as Mosquitto
    participant ESP32

    Browser->>Backend: PATCH /api/agents/{id} {"name": "New Name"}
    Backend->>SQLite: UPDATE Agent.Name
    Backend-->>Browser: 204

    Browser->>Backend: GET /api/agents/{id}/pumps
    Backend->>SQLite: SELECT Agent.PumpsJson
    SQLite-->>Backend: pump slots
    Backend-->>Browser: [{pumpIndex, ingredientId, ingredientName}]

    Browser->>Backend: PUT /api/agents/{id}/pumps [{pumpIndex, ingredientId}]
    Backend->>SQLite: UPDATE Agent.PumpsJson
    Backend->>Broker: PUBLISH cocktailmaker/agents/{agentId}/config (retained) [{pumpIndex, ingredientName}]
    Broker-->>ESP32: [{pumpIndex, ingredientName}]
    ESP32->>ESP32: persist pump map to NVS Preferences
```

> **First-boot fallback:** if an ESP32 has no NVS pump map (fresh flash, broker unreachable), dispense falls back to positional assignment (ingredient index 0 → pump 0).

### Agent health monitoring

```mermaid
sequenceDiagram
    participant ESP32
    participant Broker as Mosquitto
    participant Backend
    participant Browser

    ESP32->>Broker: CONNECT with LWT = {agentId, status:"offline"} retained
    ESP32->>Broker: PUBLISH cocktailmaker/agents/{agentId}/status "online" (retained)

    Backend->>Broker: SUBSCRIBE cocktailmaker/agents/+/status
    Broker-->>Backend: status event
    Backend->>Backend: UPDATE agent.isOnline in DB
    Backend-->>Browser: SSE: agent status changed

    Note over ESP32,Broker: on disconnect (graceful or drop)
    Broker-->>Backend: LWT → "offline"
    Backend-->>Browser: SSE: agent offline
```

---

## Data Model

```mermaid
erDiagram
    Recipe {
        int     Id                  PK
        string  Name
        string  ImageUrl            "nullable — absolute URL to recipe image"
        json    RecipeIngredients   "denormalized JSON blob"
    }
    Ingredient {
        int     Id              PK
        string  Name
        json    UsedInRecipes   "JSON list of Recipe IDs (reverse index)"
    }
    Agent {
        int      Id          PK
        string   Name        "human-readable display name"
        string   AgentId     "MQTT topic identifier — unique, immutable"
        bool     IsOnline    "set via MQTT status events"
        datetime LastSeen    "set via MQTT status events"
        json     PumpsJson   "nullable — [{pumpIndex, ingredientId, ingredientName}]"
    }
```

`Recipe.RecipeIngredients` and `Ingredient.UsedInRecipes` are **denormalized mirrors** — no join table, no DB constraint. `RecipeController` keeps them in sync on every write.

`Agent.PumpsJson` follows the same denormalized pattern — pump-ingredient mapping stored as a JSON blob, synced to the ESP32 via retained MQTT on every write.

---

## Known Mismatches

| # | Description | Location | Planned fix |
|---|-------------|----------|-------------|
| 1 | Appearance preferences (display mode, header style, font, background image URL) are client-only — persisted in `localStorage`, no backend/API involved. Runtime theming applied by setting inline CSS vars on `document.documentElement`. | `src/frontend/src/components/settings/AppearanceSettings.tsx` | Accepted; no backend persistence planned |
| 2 | `Recipe.ImageUrl` column added via raw `ALTER TABLE` in `EnsureSchema()` at startup, not via EF migrations (project has no migration history). Safe to run repeatedly; exception swallowed when column already exists. | `src/backend/Program.cs` | Accepted; migrate to EF migrations if schema evolution continues |
