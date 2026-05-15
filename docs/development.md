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

## Docker Compose files

```
src/
├── docker-compose.yml           ← production base (no ASPNETCORE_ENVIRONMENT)
└── docker-compose.override.yml  ← dev overrides (auto-merged by default)
```

Docker Compose automatically merges `docker-compose.override.yml` when you run `docker-compose up` without arguments. Specifying the file explicitly skips it.

| Command | Mode | Frontend |
|---|---|---|
| `docker-compose up` | Development | Run `npm run dev` separately on :5173 |
| `docker-compose -f docker-compose.yml up` | Production | Served from :8080 via wwwroot |

---

## Development workflow

Two servers, independent — the **Dockerfile is not used** in development.

```
Browser
  │
  ├─ localhost:5173 ──► Vite dev server   (npm run dev)
  │                        └─ HMR, instant reloads ✓
  │
  └─ localhost:8080 ──► Backend + broker  (docker-compose up)
                           └─ REST API + SSE + MQTT
```

```bash
# Terminal 1 — backend + broker (dev mode via override)
cd src && docker-compose up

# Terminal 2 — frontend with live reload
cd src/frontend && npm run dev
```

Open `http://localhost:5173`. The Vite dev server calls the backend on `:8080` via the CORS policy. HMR works as normal.

---

## Production workflow

One Docker image, one port — the **Vite dev server is not used**.

```
Browser
  │
  └─ :8080 ──► Backend container
                 ├─ /api/*   → controllers
                 └─ /*       → wwwroot/index.html  (React SPA)
```

```bash
# Build and run in production mode (override file skipped)
cd src
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up
```

The image is built once: Node compiles the frontend into `dist/`, .NET publishes the backend, and `dist/` is copied into `wwwroot/`. At runtime it is a single process on a single port with no CORS, no seed data, and no Scalar UI.

---

## Contributing workflow

1. `git checkout -b feature/<description>` (or `hotfix/`)
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `ci:` …)
3. Open a PR — fill in Task and Changes from the template
4. Run the review in Claude Code before merging:
   ```
   Review this PR using the Review Agents in AGENTS.md. Read git diff main...HEAD and evaluate each scope in order.
   ```
5. Add a row to the Last Review table in `AGENTS.md` and tick the PR checkboxes

Full policy and roadmap: [AGENTS.md](../AGENTS.md)
