---
name: real-estate-frontend-security
description: >-
  Real Estate frontend security: httpOnly auth cookie, BFF-only BACKEND_URL,
  session helpers, admin route guards. Use when touching auth, cookies, API
  routes, or env configuration.
---

# Frontend Security

## BFF boundary

- `BACKEND_URL` is server-only (`src/env.ts`). Never `NEXT_PUBLIC_*` for backend URL.
- Browser calls same-origin `/api/*` with `credentials: 'include'`.
- RSC uses `serverFetch` / `fetchBackend` with token from cookies — no JWT in client JS.

## Env (`.env.local`)

```bash
BACKEND_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
# AUTH_SECRET=…  # if used for cookie signing
```

Keep secrets out of git.

## Auth session (implemented)

| Piece | Location |
|-------|----------|
| Cookie name | `lib/auth/constants.ts` (`AUTH_COOKIE_NAME`) |
| Set/clear cookie | `lib/auth/session.ts`, `lib/auth/auth-bff.ts` |
| Read session (RSC) | `getSession()`, `getAuthToken()` |
| Login BFF | `app/api/auth/login` — sets httpOnly cookie; returns `{ user }` only |
| Logout | `app/api/auth/logout` |
| Me | `app/api/auth/me` |

Login response must not expose raw JWT to client bundle — token stays in httpOnly cookie.

## Route protection

| Surface | Guard |
|---------|-------|
| `(admin)/layout.tsx` | `getSession()` → redirect `/login` or `/` if not `platform_admin` |
| Middleware | `src/middleware.ts` — protect `/admin` routes |
| BFF admin routes | `proxyToBackend` with `requireAuth: true` (default) |

## BFF validation

- Validate query/body with zod before proxying.
- After reading `request.json()` for validation, forward via **new** `NextRequest` with stringified body (see admin change-role route).

## Operational rules

- Do not log tokens or commit `.env` with real credentials.
- Admin mutations only through authenticated BFF → backend `platform_admin` routes.

## Related skills

- Admin patterns → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Fetch → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
