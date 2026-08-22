---
name: real-estate-frontend-overview
description: >-
  Real Estate Marketplace frontend overview: Next.js App Router, stack,
  folder structure, auth, admin routes. Use when onboarding, locating modules,
  or deciding where a new page/feature belongs.
---

# Frontend Overview

## Purpose

Yemen real estate marketplace — buyers browse listings; offices publish (later). Platform admins manage users via `/admin`. All backend access goes through a Next.js BFF (`BACKEND_URL` server-only).

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind v4, lucide-react, Radix dropdown |
| Language | TypeScript strict (`@/*` → `src/`) |
| Forms | react-hook-form + zod |
| Motion | framer-motion (hero, carousels, toasts) |
| Font | Tajawal (Arabic + Latin) |
| Dev port | **3001** (backend **3000**) |

## Layout

```
src/
  app/
    (marketplace)/       # Public site
    (admin)/             # platform_admin dashboard
    api/                 # BFF: auth/*, admin/*, catalog, listings
  components/ui/         # Shared primitives (button, dropdown-menu, toaster, …)
  features/              # Domain modules
  lib/                   # api/, auth/, i18n/, errors/, hooks/, utils/
  env.ts
```

### Feature module shape

```
features/<domain>/
  components/            # UI; admin uses subfolders per resource (users/)
  services/              # serverFetch (RSC) and/or clientFetch (mutations)
  hooks/
  types/
  schemas/               # zod for forms + BFF validation
```

## Route groups

| Area | Paths |
|------|-------|
| Marketplace | `/`, `/listings`, `/login`, `/register`, `/verify-email`, `/forgot-password` |
| Admin | `/admin`, `/admin/users` (`platform_admin` only) |
| BFF auth | `/api/auth/login`, `logout`, `me`, `register`, … |
| BFF admin | `/api/admin/users`, `…/activate`, `…/change-role`, … |
| BFF public | `/api/cities/public`, `/api/listings/search`, … |

## Admin module (implemented)

```
app/(admin)/
  layout.tsx             # getSession + AdminSidebar; guards platform_admin
  admin/page.tsx         # Dashboard links
  admin/users/page.tsx   # Suspense → AdminUsersContent

features/admin/
  components/
    AdminSidebar.tsx
    users/
      AdminUsersContent.tsx   # RSC fetch
      AdminUsersPanel.tsx     # Client orchestrator
      UserTable.tsx / UserCard.tsx / UserActionsMenu.tsx
      CreateUserDialog.tsx / ChangeRoleModal.tsx
      UserBadges.tsx
  services/admin-users-service.ts

features/auth/
  services/auth-service.ts    # Client mutations + auth flows
  types/user.ts
  schemas/auth-schemas.ts
```

Full patterns → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md).

## Related skills

- Admin dashboard → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Conventions → [../code_convention/SKILL.md](../code_convention/SKILL.md)
- Architecture → [../architecture/SKILL.md](../architecture/SKILL.md)
- Security → [../security/SKILL.md](../security/SKILL.md)
