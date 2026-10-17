# ConFuse Frontend

**Port**: 3000 · **Stack**: Next.js (React, TypeScript, Tailwind CSS)

> This is the canonical README for the service; **all documentation lives in
> [`docs/`](./)** (this folder). See [index.md](index.md) for the docs index.

## Overview

Web interface for the ConFuse Knowledge Intelligence Platform:

- **Dashboard**: System status and metrics
- **Source Management**: Connect and manage data sources (repositories,
  documents, URLs)
- **Knowledge Search**: Search across code and documents
- **Billing**: Plans, usage, checkout and customer portal
- **Settings**: Configuration and API key management

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Frontend (:3000)                 │
├─────────────────────────────────────────────────┤
│  Dashboard  │  Search  │  Sources  │  Settings  │
└─────────────┴─────────┴───────────┴─────────────┘
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│auth-middleware│ │repo/doc-data │ │data-vent     │
│   (3010)     │ │-con (8081)   │ │  (3002)      │
└──────────────┘ └──────────────┘ └──────────────┘
```

Backend calls are funnelled through the typed clients in `src/lib/api.ts` and
the Next.js BFF routes under `src/app/api/**`.

## How to run the microservice

### Prerequisites

Node.js 18+, npm or yarn.

### Setup

```bash
# Install dependencies
npm install

# Environment variables (merged by start.js / next.config.js)
# .map.env (public config) + .secret.env (secrets); .env.local = optional overrides

# Run development server
npm run dev
```

### Build

```bash
npm run build
npm start
```

## Configuration

```bash
# API URLs (defaults point at local service ports)
REPO_DATA_CON_URL=http://localhost:8081
DOC_DATA_CON_URL=http://localhost:8081
AUTH_MIDDLEWARE_URL=http://localhost:3010
DATA_VENT_URL=http://localhost:3002

# Public
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_SOURCES=true
```

## Testing

UI tests (Selenium, Page Object Model) live in the central test module (this
service contains no tests):

```bash
cd ../ConFuse-test-module
pip install -r requirements.txt
pytest frontend -m selenium -v
```

## Documentation

| Document | Contents |
|----------|----------|
| [index.md](index.md) | Overview & docs index |
| [api-reference.md](api-reference.md) | BFF endpoints & API clients |
| [architecture.md](architecture.md) | App router & state design |
| [setup.md](setup.md) | Local development setup |

## Contributing

1. Follow Next.js conventions
2. Use Tailwind CSS for styling
3. Test responsive design (`frontend -m selenium` in the test module)
4. Update documentation in `docs/`
