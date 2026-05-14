# Architecture

## System Context

```mermaid
C4Context
    Person(user, "User", "Manages recipes via browser")
    System(cms, "CocktailMaker", "Recipe management and drink dispensing")
    System_Ext(hw, "ESP32 + Pumps", "Physical dispensing hardware")

    Rel(user, cms, "Uses", "HTTP")
    Rel(cms, hw, "Serves data to", "HTTP (agent-initiated only)")
```

## Containers

```mermaid
C4Container
    Person(user, "User")

    Container(frontend, "Frontend", "React / TypeScript", "Recipe and ingredient UI — port 5173")
    Container(backend, "Backend", "ASP.NET Core", "REST API — port 8080")
    ContainerDb(db, "Database", "SQLite", "Recipes, ingredients, agents")
    Container(agent, "ESP32 Agent", "C++ / Arduino", "Pump controller, polls backend")

    Rel(user, frontend, "Uses", "HTTP :5173")
    Rel(frontend, backend, "CRUD", "HTTP :8080 — hardcoded URL")
    Rel(backend, db, "Read / Write", "EF Core")
    Rel(agent, backend, "Polls + status report", "raw TCP :8080")

    UpdateRelStyle(agent, backend, $textColor="orange", $lineColor="orange")
```

> **One-way only.** The backend has no path to reach the ESP32. All communication is agent-initiated.

---

## Communication Flows

### Recipe CRUD

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

### ESP32 Boot + Poll

```mermaid
sequenceDiagram
    participant ESP32
    participant Backend

    ESP32->>Backend: POST /api/agent/{id}  ⚠ 404 — not implemented
    Note right of Backend: report_status() called on every boot,<br/>endpoint missing, silently ignored

    loop every 10 s
        Note over ESP32: delay only — no command fetching yet
    end
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
        int     Id      PK
        string  Name
        string  Address
    }
```

`Recipe.RecipeIngredients` and `Ingredient.UsedInRecipes` are **denormalized mirrors** — no join table, no DB constraint. Application code in `RecipeController` keeps them in sync on every write.

---

## Known Mismatches

| # | Location | Expected | Actual |
|---|----------|----------|--------|
| 1 | `AgentController` | Query `Agents` table | Hardcoded in-memory list; DB table exists and is seeded but never read |
| 2 | `APIClient::report_status()` | `POST /api/agent/{id}` responds | Endpoint not implemented — 404 on every boot, return value ignored |
| 3 | `Program.cs` | OpenAPI available in development | Registered only in `!IsDevelopment` |
| 4 | `main.cpp` loop | Fetch and process commands | `delay(10000)` only — polling not implemented |
| 5 | `api_client.h` | Use `HTTPClient` Arduino library | Raw TCP string construction over `WiFiClient` |
