# Development vs Production

## Environment comparison

| Feature | Development | Production |
|---|---|---|
| Frontend server | Vite dev server — port 5173, HMR | Served from backend `wwwroot` — port 8080 |
| Backend port | 8080 | 8080 |
| CORS | Allowed from `localhost:5173` | Not needed (same origin) |
| Seed data | ✓ inserted on startup | ✗ |
| OpenAPI / Scalar UI | ✓ at `/scalar/v1` | ✗ |
| HSTS / HTTPS redirect | ✗ | ✓ |
| Triggered by | `ASPNETCORE_ENVIRONMENT=Development` | anything else (default: `Production`) |

---

## Development workflow

Two servers, independent — the Dockerfile is **not used** in development.

```
Browser
  │
  ├─ localhost:5173 ──► Vite dev server (npm run dev)
  │                        └─ HMR, instant reloads ✓
  │
  └─ localhost:8080 ──► Backend (dotnet run or docker-compose)
                           └─ REST API + SSE + MQTT
```

```bash
# Terminal 1 — backend + broker
cd src && docker-compose up

# Terminal 2 — frontend with live reload
cd src/frontend && npm run dev
```

Open `http://localhost:5173` — the Vite dev server proxies API calls to `:8080` via the CORS policy. HMR works exactly as before. The Dockerfile change has no effect on this workflow.

---

## Production workflow

One Docker image, one port — the Vite dev server is **not used**.

```
Browser
  │
  └─ :8080 ──► Backend container
                 ├─ /api/*       → controllers
                 ├─ /scalar/*    → (disabled)
                 └─ /*           → wwwroot/index.html (React SPA)
```

The image is built once: Node compiles the frontend into `dist/`, .NET publishes the backend, and `dist/` is copied into `wwwroot/`. At runtime it is a single process on a single port.

```bash
# Build and run the production image
cd src && docker-compose -p cocktailmaker build && docker-compose -p cocktailmaker up
```

> **Note:** `docker-compose.yml` currently sets `ASPNETCORE_ENVIRONMENT=Development`, which re-enables seed data and Scalar UI even in the Docker image. For a true production deployment, remove that variable or override it with `ASPNETCORE_ENVIRONMENT=Production`.

---

## Summary

> The Dockerfile including the frontend does **not** affect local development. You always run the Vite dev server directly for development — it gives you HMR, fast builds, and source maps. Docker is only the production packaging step.
