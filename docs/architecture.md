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

    Container(frontend, "Frontend", "React / TypeScript", "Recipe UI + agent health — port 5173")
    Container(backend, "Backend", "ASP.NET Core", "REST API + MQTT client — port 8080")
    Container(broker, "MQTT Broker", "Mosquitto", "Event bus — port 1883, runs on Pi")
    ContainerDb(db, "Database", "SQLite", "Recipes, ingredients, agents")
    Container(agent, "ESP32 Agent", "C++ / PubSubClient", "Pump controller")

    Rel(user, frontend, "Uses", "HTTP :5173")
    Rel(frontend, backend, "CRUD + SSE", "HTTP :8080")
    Rel(backend, db, "Read / Write", "EF Core")
    Rel(backend, broker, "Publish commands / Subscribe status", "MQTT :1883")
    Rel(agent, broker, "Subscribe commands / Publish status + LWT", "MQTT :1883")
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

    Browser->>Backend: GET /api/recipe
    Backend->>SQLite: SELECT
    SQLite-->>Backend: rows
    Backend-->>Browser: Recipe[]

    Browser->>Backend: POST /api/recipe
    Backend->>SQLite: INSERT recipe (ingredients as JSON blob)
    Backend->>SQLite: UPSERT Ingredient rows + update UsedInRecipes
    Backend-->>Browser: 201 Created
```

### Dispense command (Browser → Backend → Agent)

```mermaid
sequenceDiagram
    participant Browser
    participant Backend
    participant Broker as Mosquitto
    participant ESP32

    Browser->>Backend: POST /api/agent/{id}/dispense {recipeId}
    Backend->>Broker: PUBLISH cocktailmaker/agents/{id}/command
    Broker-->>ESP32: {recipeId}
    ESP32->>Backend: GET /api/recipe/{id}
    Backend-->>ESP32: Recipe + ingredients
    ESP32->>ESP32: dispense pumps
```

### Agent health monitoring (LWT + SSE)

```mermaid
sequenceDiagram
    participant ESP32
    participant Broker as Mosquitto
    participant Backend
    participant Browser

    ESP32->>Broker: CONNECT with LWT = {id, status:"offline"} retained
    ESP32->>Broker: PUBLISH status {id, status:"online"} retained

    Backend->>Broker: SUBSCRIBE cocktailmaker/agents/+/status
    Broker-->>Backend: status event
    Backend->>Backend: UPDATE agent.isOnline in DB
    Backend-->>Browser: SSE: agent status changed

    Note over ESP32,Broker: on disconnect (graceful or drop)
    Broker-->>Backend: LWT → status "offline"
    Backend-->>Browser: SSE: agent offline
```

---

## Data Model

```mermaid
erDiagram
    Recipe {
        int     Id                  PK
        string  Name
        json    RecipeIngredients   "denormalized JSON blob"
    }
    Ingredient {
        int     Id              PK
        string  Name
        json    UsedInRecipes   "JSON list of Recipe IDs (reverse index)"
    }
    Agent {
        int     Id          PK
        string  Name
        string  Address
        bool    IsOnline    "pending — set via MQTT status events"
        datetime LastSeen   "pending"
    }
```

`Recipe.RecipeIngredients` and `Ingredient.UsedInRecipes` are **denormalized mirrors** — no join table, no DB constraint. `RecipeController` keeps them in sync on every write.

---

## Known Mismatches

| # | Location | Expected | Actual |
|---|----------|----------|--------|
| 1 | `AgentController` | Query `Agents` table | Hardcoded in-memory list |
| 2 | `APIClient::report_status()` | Status via MQTT LWT | HTTP POST to missing endpoint |
| 3 | `Program.cs` | OpenAPI in development | Registered only in `!IsDevelopment` |
| 4 | `main.cpp` loop | MQTT subscription callback | `delay(10000)` only |
| 5 | `api_client.h` | `PubSubClient` for MQTT | Raw TCP `WiFiClient` |
