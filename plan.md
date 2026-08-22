# Real Estate Marketplace — Frontend Plan

Yemen-focused public marketplace (buyers browse listings, offices publish). Built with **Next.js 14+ App Router**, **FDA**, and a **BFF layer** (`/api/*` → Node backend).

Reference project: **`Aura_Tech`** — reuse patterns from `lib/api`, `lib/auth`, `lib/i18n`, cookie session, and `fetchBackend` / `serverFetch`.

---

## 1. Goals

| Goal | Approach |
|------|----------|
| Secure API access | Browser never calls Node backend directly; only `/api/*` |
| Fast first paint | Server Components + cached public reads |
| RTL + Arabic first | i18n like Aura_Tech (`ar` default, `en` optional) |
| Type safety | TypeScript + Zod at API route boundaries |
| Incremental delivery | **One page at a time** — start with **Home** only |

---

## 2. Runtime topology

```
Browser
  → Next.js (e.g. :3001)
      → app/(marketplace)/page.tsx          [Server Component]
      → app/api/listings/search/route.ts    [BFF proxy]
  → Node backend (e.g. :3000/api)
      → GET /listings/search
      → GET /cities/public, /property-types/public, …
```

**Env (`.env.local`)**

```bash
# Server-only — never expose raw backend to client fetch
BACKEND_URL=http://localhost:3000/api

# Next app URL (optional, for absolute links)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Maps (listing detail phase — not home v1)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=

# Auth (later phases)
AUTH_SECRET=
```

> Note: Backend runs on **3000** today. Next dev typically uses **3001** to avoid port clash.

---

## 3. Backend contracts (already implemented)

Align frontend types with **`Real-Estate`** backend — not generic mock shapes.

### Listings search (home featured grid)

`GET /api/listings/search?limit=8&sort=created_at`

Response (`APIResponse`):

```json
{
  "success": true,
  "message": "...",
  "data": [ /* PublicListing[] */ ],
  "next_cursor": null,
  "has_more": false
}
```

`PublicListing` fields: `id`, `title`, `slug`, `price`, `property_type`, `transaction_type`, `property_subtype`, `city_name`, `neighborhood_name`, `address`, `latitude`, `longitude`, `status`, `main_photo`, `published_at`, `created_at`.

Sort options: `created_at` | `most_saved` | `most_viewed` | `description_length`.

### Listing detail (Phase 2 — not home)

`GET /api/listings/:id` → `PublicListingDetails`

### Near-by map tab (Phase 3)

`GET /api/listings/:id/near-by-points?radius=5000&category=schools`

### Auth / saved (Phase 4+)

- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/listings/saved` (authenticated)
- `POST /api/listings/:id/save`

### Catalog for filters (home search bar — partial on home)

- `GET /api/cities/public`
- `GET /api/property-types/public`
- `GET /api/transaction-types/public`

---

## 4. Architecture rules (from FDA + Aura_Tech)

> **Agent skills:** Full conventions live in [`.cursor/SKILL_FILES/SKILL.md`](.cursor/SKILL_FILES/SKILL.md) (mirrors Aura_Tech structure). Read `server_client_fetch` and `architecture` skills before adding data loading.

### DO

- Keep **`app/` thin** — compose features, no business logic
- **`features/`** own domain: types, schemas, services, components, hooks
- **`lib/`** only infrastructure: api, auth, i18n, errors, utils, cn
- **Server Components fetch all initial page data** — via `catalogService` / `listingService` + `serverFetch` (see `FeaturedListings`, `ExploreCities`)
- **Client Components** only for: locale toggle, mobile menu, search modal UI, carousel scroll/arrows
- **Zod** validate BFF query/body before proxying
- **React Query** for client refetch/pagination later; home v1 is RSC + minimal client islands

### DON'T

- `useEffect` + `clientFetch` for section initial loads — use async RSC + feature services
- `fetch(BACKEND_URL)` from `'use client'` components
- Duplicate backend DTOs with wrong field names (`bedrooms` vs `property_specs`)
- Build listing detail / auth / messages in Phase 1
- Put UI components in `lib/`

---

## 5. Project structure (target)

```
real-estate-frontend/
├── plan.md                          ← this file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── listings/
│   │   │       └── search/route.ts  ← Phase 1
│   │   ├── (marketplace)/
│   │   │   ├── layout.tsx           ← Phase 1 (header/footer shell)
│   │   │   └── page.tsx             ← Phase 1 HOME
│   │   ├── layout.tsx               ← Phase 1 (fonts, i18n, providers)
│   │   ├── globals.css              ← Phase 1 (design tokens)
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── home/                    ← Phase 1 scope
│   │   │   ├── components/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── FeaturedListings.tsx
│   │   │   │   ├── CategoryStrip.tsx
│   │   │   │   └── TrustSection.tsx
│   │   │   └── constants/
│   │   │       └── home-content.ts
│   │   ├── listings/                ← shared listing UI (Phase 1 card only)
│   │   │   ├── components/
│   │   │   │   ├── ListingCard.tsx
│   │   │   │   └── ListingGrid.tsx
│   │   │   ├── services/
│   │   │   │   └── listing-service.ts
│   │   │   ├── types/
│   │   │   │   └── listing.ts
│   │   │   └── schemas/
│   │   │       └── search-schema.ts
│   │   ├── search/                  ← Phase 1: hero search bar only
│   │   │   └── components/
│   │   │       └── HeroSearchBar.tsx
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── SiteHeader.tsx
│   │       │   ├── SiteFooter.tsx
│   │       │   └── ListingCardSkeleton.tsx
│   │       └── components/ui/       ← shadcn
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── fetch.ts             ← Aura_Tech-style fetchBackend
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   ├── parse-response.ts
│   │   │   └── cache.ts
│   │   ├── auth/
│   │   │   ├── session.ts           ← Phase 4
│   │   │   └── constants.ts
│   │   ├── i18n/
│   │   │   ├── ar.ts
│   │   │   ├── en.ts
│   │   │   ├── server.ts
│   │   │   └── locale-provider.tsx
│   │   ├── errors/
│   │   │   └── api-error.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── currency.ts          ← YER formatting
│   │       └── format.ts
│   │
│   ├── env.ts                       ← Zod-validated env
│   └── middleware.ts                ← locale cookie; auth later
│
├── components.json                  ← shadcn
├── tailwind.config.ts
└── package.json
```

Features **not** in repo until their phase: `offices/`, `messages/`, full `auth/` pages, listing `[id]`.

---

## 6. Design system

CSS variables in `globals.css` (Tailwind `@theme` or `:root`):

| Token | Value | Usage |
|-------|-------|--------|
| `--primary` | `#1e293b` | Header, headings, trust |
| `--primary-light` | `#334155` | Hover |
| `--primary-dark` | `#0f172a` | Strong text |
| `--secondary` | `#dc2626` | CTAs, accents |
| `--accent-success` | `#16a34a` | Verified badge |
| `--accent-warning` | `#f59e0b` | Pending |
| `--sold` | `#8b5cf6` | Sold chip (later) |

Typography: **Arabic-first** — `Noto Sans Arabic` + Latin fallback.  
Layout: max-width `7xl`, generous whitespace, card-based listing grid.

---

## 7. Phase roadmap

### Phase 0 — Scaffold (½ day)

- [ ] `create-next-app` (TypeScript, Tailwind, App Router, `src/`)
- [ ] shadcn/ui init + `button`, `card`, `input`, `badge`, `skeleton`
- [ ] Copy/adapt from Aura_Tech: `lib/api/fetch.ts`, `server.ts`, `parse-response`, `api-error`, `cn`
- [ ] `env.ts` with Zod
- [ ] i18n skeleton (`ar` / `en`, cookie `re-locale`)
- [ ] Design tokens in `globals.css`
- [ ] Verify BFF can reach backend health: `GET /api/health`

### Phase 1 — Home screen only (current focus)

**Route:** `app/(marketplace)/page.tsx`

**Sections (top → bottom):**

1. **Site header** — logo, nav placeholders (Listings, Offices — links inactive or `#`), locale toggle, login placeholder
2. **Hero** — headline + subcopy (i18n), **HeroSearchBar** (city / transaction type / submit → `/listings?…` later)
3. **Category strip** — property type icons (static or from `/property-types/public` if ready)
4. **Featured listings** — `GET /listings/search?limit=8&sort=created_at` via BFF
5. **Trust section** — verified offices, safe search (static marketing)
6. **Footer** — links placeholder, Arabic copy

**Data flow (featured listings):**

```
HomePage (RSC)
  → listingService.getFeatured()
  → serverFetch → BACKEND_URL/listings/search?limit=8
  → FeaturedListings → ListingGrid → ListingCard
```

**BFF:**

```
GET /api/listings/search?limit=8&sort=created_at
  → Zod validate
  → proxy to backend
  → return { success, data, next_cursor, has_more }
```

**Empty / error states:**

- Skeleton grid while loading (Suspense)
- Empty state if no published listings
- Friendly error banner if backend down

**Out of scope for Phase 1:**

- Listing detail page
- Auth flows
- Saved listings
- Map / near-by-points
- Offices directory
- Messages
- Filter sidebar on `/listings`

### Phase 2 — Listings browse + detail

- `/listings` grid, filters, cursor pagination
- `/listings/[id]` detail, gallery, office block
- Client sort (price) on fetched page per backend note

### Phase 3 — Map tab

- `@react-google-maps/api`, near-by-points sidebar categories
- Photo media URLs built on client from `photos` ref

### Phase 4 — Auth + saved + report

- Cookie session (Aura_Tech pattern)
- Save / unsave, report listing
- `/saved` page

### Phase 5 — Offices + messages

- Office public profile
- Messaging (when backend ready)

---

## 8. Phase 1 file checklist

Create in this order:

| # | File | Purpose |
|---|------|---------|
| 1 | `src/env.ts` | Validate `BACKEND_URL` |
| 2 | `src/lib/errors/api-error.ts` | Typed errors |
| 3 | `src/lib/api/endpoints.ts` | Backend path constants |
| 4 | `src/lib/api/fetch.ts` | Low-level backend fetch |
| 5 | `src/lib/api/server.ts` | `serverFetch` wrapper |
| 6 | `src/lib/api/parse-response.ts` | `APIResponse<T>` parser |
| 7 | `src/features/listings/types/listing.ts` | Mirror `PublicListing` |
| 8 | `src/features/listings/schemas/search-schema.ts` | Query Zod |
| 9 | `src/features/listings/services/listing-service.ts` | `getFeatured`, `search` |
| 10 | `src/app/api/listings/search/route.ts` | BFF |
| 11 | `src/lib/i18n/*` | ar/en dictionaries |
| 12 | `src/features/shared/components/SiteHeader.tsx` | Shell |
| 13 | `src/features/listings/components/ListingCard.tsx` | Card |
| 14 | `src/features/listings/components/ListingGrid.tsx` | Grid |
| 15 | `src/features/home/components/*` | Hero, featured, trust |
| 16 | `src/app/(marketplace)/layout.tsx` | Marketplace shell |
| 17 | `src/app/(marketplace)/page.tsx` | **Home** |

---

## 9. Home page wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    الرئيسية   العقارات   المكاتب          AR | EN  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     اعثر على منزلك في اليمن                                 │
│     آلاف العقارات من مكاتب موثّقة                           │
│                                                             │
│     [ City ▼ ] [ Buy/Rent ▼ ] [ 🔍 بحث ]                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [شقة] [فilla] [أرض] [تجاري]  ← category strip             │
├─────────────────────────────────────────────────────────────┤
│  أحدث العقارات                          [عرض الكل →]        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ card │ │ card │ │ card │ │ card │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ card │ │ card │ │ card │ │ card │                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
├─────────────────────────────────────────────────────────────┤
│  ✓ مكاتب موثّقة   ✓ بحث متقدم   ✓ خرائط تفاعلية (قريباً)   │
├─────────────────────────────────────────────────────────────┤
│  Footer © 2026                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Key types (Phase 1)

```typescript
// features/listings/types/listing.ts — match backend PublicListing

export interface PublicListingCatalogItem {
  name: string
  icon: string | null
}

export interface PublicListing {
  id: string
  title: string
  slug: string
  price: string
  property_type: PublicListingCatalogItem
  transaction_type: PublicListingCatalogItem
  property_subtype: PublicListingCatalogItem
  city_name: string
  neighborhood_name: string
  address: string
  latitude: string
  longitude: string
  status: 'published' | 'draft' | 'sold' | 'rented'
  main_photo: string | null
  published_at: string | null
  created_at: string
}

export interface ListingSearchResult {
  items: PublicListing[]
  next_cursor: string | null
  has_more: boolean
}
```

---

## 11. Aura_Tech patterns to copy

| Aura_Tech | Real estate use |
|-----------|-----------------|
| `lib/api/fetch.ts` | Single backend fetch with timeout + errors |
| `lib/api/server.ts` | RSC data loading |
| `lib/api/parse-response.ts` | `{ success, data, message }` |
| `lib/auth/session.ts` | Phase 4 — httpOnly cookie |
| `lib/i18n/server.ts` + `locale-provider.tsx` | AR default, EN toggle |
| `lib/utils/cn.ts` | Tailwind merge |
| Feature folders | `features/home`, `features/listings` |

---

## 12. Commands (Phase 0)

```bash
cd D:\Frontend\Next.js\real-estate-frontend

npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

npm install zod @tanstack/react-query zustand react-hook-form @hookform/resolvers framer-motion lucide-react clsx tailwind-merge

npx shadcn@latest init
npx shadcn@latest add button card input badge skeleton separator
```

---

## 13. Definition of done — Phase 1 (Home)

- [ ] Home loads at `/` with Arabic RTL default
- [ ] Featured listings render from real backend (or graceful empty/error)
- [ ] Listing cards show photo, price (YER), title, city, type badges
- [ ] Hero search navigates to `/listings?…` (page can 404 until Phase 2)
- [ ] No direct backend URL in client bundle
- [ ] Lighthouse: no layout shift from skeleton → content
- [ ] `npm run build` passes

---

## 14. Next step

After you approve this plan:

1. Run **Phase 0 scaffold** in `real-estate-frontend`
2. Implement **Phase 1 home only** — no other routes except `/api/listings/search`

No listing detail, auth, or map until Phase 2+.
