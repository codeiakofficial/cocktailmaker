# cocktailmaker

Recipe management and drink dispensing. Runs on a Raspberry Pi — manages cocktail recipes and controls ESP32-based pump dispensers over MQTT.

## Architecture

```mermaid
flowchart LR
    Browser --> Frontend["Frontend\nReact · :5173 dev / :8080 prod"]
    Frontend -->|"HTTP :8080"| Backend["Backend\nASP.NET Core"]
    Backend --> DB[(SQLite)]
    Backend -->|"MQTT :1883"| Broker[Mosquitto]
    Broker <-->|"MQTT :1883"| ESP32["ESP32 Agent\n4-pump controller"]
```

Full documentation: [docs/architecture.md](docs/architecture.md) · [docs/requirements.md](docs/requirements.md)

Coverage reports: [codeiakofficial.github.io/cocktailmaker](https://codeiakofficial.github.io/cocktailmaker/) *(published on every merge to main)*

## Quick Start

```bash
# Backend + broker (dev mode)
cd src && docker-compose up

# Frontend with live reload (separate terminal)
cd src/frontend && npm run dev
```

Open `http://localhost:5173`. See [docs/development.md](docs/development.md) for dev vs production details.

## Contributing

See [docs/development.md](docs/development.md) for the contributing workflow and [AGENTS.md](AGENTS.md) for the full PR policy and roadmap.
