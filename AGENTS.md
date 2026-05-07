# Agents

When creating new custom agents, keep them small and focused:

- `backend` for .NET implementation
- `frontend` for React and UI logic
- `infra` for Docker and environment setup

## Setup

Frontend: `npm install`

## Build & Run

Backend: `docker-compose -p cocktailmaker build && docker-compose -p cocktailmaker up`

Frontend: `npm run dev`

## Backend Agent

- **Purpose**: Work on the .NET backend, API controllers, EF Core, database setup, and migrations.
- **Best for**: `src/backend/`, database connection changes, entity model updates, API endpoint implementation, and `Dockerfile` backend build steps.
- **Use when**: You need code changes related to server behavior, database persistence, or backend build/runtime issues.

## Frontend Agent

- **Purpose**: Work on React UI, TypeScript components, styling, and client-side behavior.
- **Best for**: `src/frontend/`, component refactors, layout fixes, input handling, React hooks, and UI library integration.
- **Use when**: You need help with component structure, props typing, interaction state, or front-end build issues.

## Infrastructure Agent

- **Purpose**: Work on Docker, compose, runtime configuration, and toolchain wiring.
- **Best for**: `src/docker-compose.yml`, `src/Dockerfile`, container startup, port bindings, and persistence.
- **Use when**: You need to adjust container volumes, rebuild flows, or debug runtime environment issues.

## How to use

Use these agent roles as a guide when deciding whether a task belongs in the backend, frontend, or infra area. If you want to add a new agent profile, create a file under `agents/` and describe its purpose, inputs, and expected outputs.
