# General Instructions

- Ignore all other `*.md` if not mentioned explicitly.
- Don't create files or functionalities if not asked for.

# Build & Run

Backend via docker in `src` directory: `docker-compose -p cocktailmaker build && docker-compose -p cocktailmaker up`
Frontend in `src/frontend` directory: `npm run dev`
Agent (ESP32) in `src/agent` directory: `pio run -e esp32`

# Tests

Backend in `tests/backend` directory: `dotnet test`
Frontend in `src/frontend` directory: `npm test`
Agent (native) in `src/agent` directory: `pio test -e test`
