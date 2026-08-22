---
name: real-estate-frontend-services
description: >-
  Real Estate feature services: server services for RSC, auth-service client
  mutations, admin-users-service, endpoints map. Use when adding API calls or
  BFF routes.
---

# Frontend Services

## Where they live

```
features/<domain>/services/
  <domain>-service.ts       # server-only → serverFetch → backendPaths
features/auth/services/
  auth-service.ts           # client → clientFetch → bffPaths (auth + admin mutations)
```

## Path rules

| Caller | Helper | Path constant | Example |
|--------|--------|---------------|---------|
| RSC / server service | `serverFetch` | `backendPaths.*` | `backendPaths.auth.users` |
| Browser / Panel | `clientFetch` | `bffPaths.*` | `bffPaths.admin.activateUser(id)` |

Central map: `lib/api/endpoints.ts`.

## Domains

| Feature | Service | Role |
|---------|---------|------|
| catalog | `catalog-service.ts` | Public catalog (cities, property types, …) |
| listings | `listing-service.ts` | Search, featured |
| admin | `admin-users-service.ts` | **Server** `getAdminUsers()` for RSC Content |
| auth | `auth-service.ts` | Login, register, **admin user mutations** |

### Admin split (important)

- **Initial list load:** `getAdminUsers()` in `admin-users-service.ts` — called from `AdminUsersContent` (RSC), uses `getAuthToken()`.
- **Mutations & load-more:** `auth-service.ts` — `activateUser`, `changeUserRole`, `loadMoreUsers`, `createAdminUser`, etc. → `/api/admin/*`.

Do not call `clientFetch` for admin page first paint.

### auth-service admin methods (client)

`createAdminUser`, `activateUser`, `deactivateUser`, `changeUserRole`, `changeUserPassword`, `softDeleteUser`, `restoreUser`, `hardDeleteUser`, `loadMoreUsers`

`changeUserRole` accepts `AssignableUserRole` (`buyer` | `office` only).

## Response contract

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  next_cursor?: string | null;
  has_more?: boolean;
}
```

Failures throw `ApiError`; use `getErrorMessage()` in UI/toasts.

## BFF routes (admin)

| Route | Purpose |
|-------|---------|
| `GET/POST /api/admin/users` | List / create |
| `PATCH …/activate`, `…/deactivate` | Status |
| `PATCH …/change-role` | Role (body: `{ role }`) |
| `PATCH …/change-password` | Admin reset password |
| `POST …/soft-delete`, `…/restore` | Soft delete lifecycle |
| `DELETE /api/admin/users/[id]` | Hard delete |

Validate with zod in `features/auth/schemas/auth-schemas.ts`. Body routes must re-wrap JSON — see [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md).

## Adding a service

1. Align types with backend DTO.
2. Add `backendPaths` / `bffPaths`.
3. Server method for RSC initial load; client methods for mutations if needed.
4. BFF route(s) with zod validation.
5. Wire Content + Panel per [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md).

## Related skills

- Admin dashboard → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Fetch → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
