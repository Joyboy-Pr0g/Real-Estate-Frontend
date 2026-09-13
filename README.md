# Real Estate Marketplace — Frontend

Arabic-first (RTL) web application for **اليمن للعقارات**. Public marketplace, buyer/office dashboard, and admin console. All backend access goes through a Next.js **backend-for-frontend (BFF)** — the browser never calls the Express API directly.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript strict |
| Forms | react-hook-form + zod |
| Client data | TanStack React Query v5 |
| Maps | Google Maps (`@react-google-maps/api`) |
| Realtime | socket.io-client |
| Push | Firebase (client SDK) |
| Font | Tajawal (Arabic + Latin) |

## Prerequisites

- Node.js 20+
- Backend API running on port **3000**
- Copy `.env.example` → `.env.local`

## Quick start

```bash
cd D:\Frontend\Next.js\real-estate-frontend
npm install
cp .env.example .env.local   # set BACKEND_URL and public keys

npm run dev                  # http://localhost:3001
```

Backend must be running separately:

```bash
cd D:\Backend\Node.js\Real-Estate
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port 3001 (webpack) |
| `npm run dev:turbo` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run process:yemen-geo` | Process Yemen GeoJSON boundary data |

## Environment variables

Server-only (never exposed to the browser):

| Variable | Example | Purpose |
|----------|---------|---------|
| `BACKEND_URL` | `http://localhost:3000/api` | BFF proxy target |
| `APP_URL` | `http://localhost:3001` | App origin |
| `SITE_URL` | `http://localhost:3001` | SEO / canonical URLs |
| `SOCKET_URL` | `http://localhost:3000` | Realtime messaging (defaults from backend host) |

Public (client):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Listing detail map |
| `NEXT_PUBLIC_FIREBASE_*` | Web push notifications |

See `.env.example` for all keys.

## Project structure

```
src/
├── app/
│   ├── (marketplace)/     # Public site: listings, map, offices
│   ├── (dashboard)/       # Buyer & office user dashboard
│   ├── (admin)/           # Platform admin + sub-admin
│   ├── (auth)/            # Login, register, verify-email
│   └── api/               # BFF route handlers (~160 routes)
├── components/ui/         # Shared UI primitives
├── features/            # Domain modules (listings, messaging, admin, …)
└── lib/
    ├── api/               # serverFetch, clientFetch, endpoints
    ├── auth/              # Session, cookies, guards
    ├── query/             # React Query provider + keys
    └── marketplace/       # Cache tags + revalidation
```

Feature module shape:

```
src/features/<domain>/
├── components/
├── services/              # server + client fetch helpers
├── hooks/
├── types/
└── schemas/               # zod for forms + BFF validation
```

## Route groups

| Area | Paths |
|------|-------|
| Marketplace | `/`, `/listings`, `/listings/map`, `/listings/[slug]`, `/offices` |
| Auth | `/login`, `/register`, `/verify-email`, `/forgot-password` |
| Dashboard | `/dashboard`, `/dashboard/messages`, `/dashboard/office`, … |
| Admin | `/admin`, `/admin/users`, `/admin/listings`, … |
| BFF | `/api/auth/*`, `/api/listings/*`, `/api/admin/*`, … |

## Architecture notes

### Authentication

- JWT stored in httpOnly `auth_token` cookie via BFF login route
- `getSession()` (React `cache()`) deduplicates server-side session reads
- Sub-admin permissions cached in a separate httpOnly cookie

### Data fetching

- **SSR first paint:** server components fetch via `serverFetch` with cache tags
- **Interactive listings:** TanStack `useInfiniteQuery` refetches on URL filter changes (no full page reload)
- **Mutations:** client → BFF → backend; BFF triggers `revalidateTag` + React Query invalidation

### Security

- `BACKEND_URL` is server-only — never use `NEXT_PUBLIC_` for the API base
- Bearer tokens attached server-side in BFF handlers only

## Backend

- Repo: `D:\Backend\Node.js\Real-Estate`
- Default dev URL: `http://localhost:3000/api`
- Set backend `CORS_ORIGIN=http://localhost:3001`

## Documentation

Full system overview (architecture, workflows, DB schema):

- `D:\Backend\Node.js\Real-Estate\REAL_ESTATE_SYSTEM_OVERVIEW_FOR_CLAUDE.md`

Cursor skills (conventions, architecture, security):

- `.cursor/SKILL_FILES/`
