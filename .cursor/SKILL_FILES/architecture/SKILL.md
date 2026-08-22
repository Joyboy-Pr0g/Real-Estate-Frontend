---
name: real-estate-frontend-architecture
description: >-
  Real Estate frontend page architecture: thin App Router pages, RSC data fetch,
  client islands, admin Content/Panel pattern, BFF proxies. Use when building
  marketplace or admin pages.
---

# Frontend Architecture

## Marketplace page stack

Public pages: **thin page → async RSC section → client island**.

```
app/(marketplace)/page.tsx
features/home/components/
  featured-listings.tsx    # async RSC → listingService
  listings-carousel.tsx    # client: scroll only
features/*/services/*-service.ts
app/api/**/route.ts        # BFF for browser callers
```

See home (`FeaturedListings`, `ExploreCities`) and listings page for filter + cursor patterns.

## Admin page stack

Admin list/management pages use **Content (RSC) + Panel (client)** — not a single monolithic client page.

```
app/(admin)/admin/<resource>/page.tsx
  Container + Suspense + skeleton
    └── <Resource>Content.tsx          # server: searchParams → *-service.ts
          └── <Resource>Panel.tsx      # client: filters, mutations, modals
                ├── <Resource>Table.tsx    (lg+)
                ├── <Resource>Card.tsx     (< lg, mapped in Panel)
                └── *ActionsMenu per row
```

Reference: `/admin/users` — [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md).

| Layer | Role |
|-------|------|
| `page.tsx` | Route shell only |
| `*Content.tsx` | Initial fetch, pass `initial` props |
| `*Panel.tsx` | URL filters, `router.refresh()`, toasts, `runAction`, load-more |
| `*Table` / `*Card` | Responsive presentation + action callbacks |
| `*ActionsMenu` | Dropdown row actions |

## Layer responsibilities (shared)

| Layer | Role |
|-------|------|
| Async RSC | `getServerTranslations()` or pass labels to client; call `*-service.ts` |
| Client island | Interactivity: carousels, forms, admin panels, modals |
| `*-service.ts` (server) | `serverFetch` + token when auth required |
| `auth-service.ts` (client) | `clientFetch` → `bffPaths` for mutations |
| BFF `app/api/**` | Zod validate; proxy to backend (see body re-wrap rule) |

## Listings page

1. Server: `ListingsContent` reads `searchParams`, `listingService.search()`.
2. Client filters sync to URL; optional `clientFetch` for cursor load-more.

## Adding a marketplace section

1. Backend route + types
2. `backendPaths` / BFF if browser needs it
3. `*-service.ts` with `serverFetch`
4. Async RSC wrapper + client island if needed
5. Wire in `page.tsx` with `<Suspense>`

## Adding an admin resource

Follow [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md) checklist (Content, Panel, Table, Card, ActionsMenu, BFF, toasts).

## Related skills

- Admin dashboard → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Fetch → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
- Services → [../services/SKILL.md](../services/SKILL.md)
