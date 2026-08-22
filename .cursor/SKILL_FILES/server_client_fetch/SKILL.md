---
name: real-estate-frontend-server-client-fetch
description: >-
  Real Estate data fetching: serverFetch, clientFetch, fetchBackend, proxyToBackend,
  BFF body re-wrap pitfall. Use when loading data in RSC, browser mutations, or
  writing app/api route handlers.
---

# Server Fetch & Client Fetch

## Flow

```
Browser  --clientFetch('/api/...')-->  app/api/*  --proxyToBackend/fetchBackend-->  BACKEND_URL
RSC      --serverFetch('/...')------>  fetchBackend --------------------------------^
```

## Helpers

| Helper | File | Role |
|--------|------|------|
| `fetchBackend` | `lib/api/fetch.ts` | Absolute backend URL; cache; `searchParams`; JSON body |
| `serverFetch` | `lib/api/server.ts` | Server wrapper |
| `clientFetch` | `lib/api/client.ts` | Browser → `/api/...`; `credentials: 'include'` |
| `proxyToBackend` | `lib/api/route-handler.ts` | BFF route helper; reads body from request |

Paths: `lib/api/endpoints.ts` → `backendPaths` (server), `bffPaths` (client).

## Usage

**Server (RSC / admin Content):**

```ts
const token = await getAuthToken();
const res = await serverFetch<AdminUserListItem[]>(backendPaths.auth.users, {
  token,
  cacheProfile: 'none',
  searchParams: { role, limit: 20 },
});
```

**Client (Panel mutations, load-more):**

```ts
await clientFetch(bffPaths.admin.changeUserRole(userId), {
  method: 'PATCH',
  body: { role: 'office' },
});
```

## BFF route patterns

### GET (query only)

Validate search params → `proxyToBackend` with `searchParams` object. Safe to pass original `request`.

### POST/PATCH with JSON body

```ts
const body = await request.json();
const parsed = schema.safeParse(body);
if (!parsed.success) return NextResponse.json({ … }, { status: 400 });

return proxyToBackend(
  new NextRequest(request.url, {
    method: 'POST', // or PATCH
    headers: request.headers,
    body: JSON.stringify(parsed.data),
  }),
  { path: backendPaths.auth.users, method: 'POST' },
);
```

### Body stream pitfall (critical)

`request.json()` consumes the body **once**. If the route validates JSON then calls `proxyToBackend(request, …)` on the **same** request, the backend receives an empty body → validation errors like `نوع المستخدم مطلوب`.

Fixed in: `app/api/admin/users/route.ts` (POST), `change-role/route.ts` (PATCH). Apply same pattern to any new body-validating BFF route.

Auth routes (`login`, `register`, `verify-email`, …) use the same re-wrap pattern.

## Cache profiles

`lib/api/cache.ts`: `short`, `long`, `none`. Admin/auth always `none`.

## Rules

1. Never `clientFetch` for admin/marketplace **initial** page data — use RSC + server service.
2. Never hardcode backend URLs — use path constants.
3. Non-success `ApiResponse` → `ApiError`; surface with `getErrorMessage()` + `toast.error`.
4. Admin list refresh after mutation: `router.refresh()` from Panel (not re-fetch entire page client-side on mount).

## Related skills

- Admin dashboard → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Services → [../services/SKILL.md](../services/SKILL.md)
