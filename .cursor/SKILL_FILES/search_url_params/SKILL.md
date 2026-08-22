---
name: real-estate-frontend-search-url-params
description: >-
  Listing search URL params: slugs and pcodes in the browser URL, UUID ids only
  on the server when calling listing search. Use when building links, listings
  page filters, or resolving searchParams.
---

# Listing search URL params

## Rule

**Never expose UUIDs in marketplace URLs.** Users see slugs / pcodes; the server resolves them to backend ids before `listingService.search()`.

| URL param (public) | Value | Resolved to (server → API) |
|--------------------|-------|----------------------------|
| `property_type` | property type **slug** | `property_type_id` |
| `property_subtype` | subtype **slug** | `property_subtype_id` |
| `transaction_type` | transaction type **slug** | `transaction_type_id` |
| `city` | city **pcode** | `city_id` |
| `neighborhood` | neighborhood **pcode** (`neighb_pcode`) | `neighborhood_id` |
| `min_price` | string | `min_price` |
| `max_price` | string | `max_price` |
| `sort` | enum | `sort` |
| `cursor` | string | `cursor` |
| `limit` | number | `limit` |

Constants: `features/listings/constants/search-url-params.ts` → `LISTING_URL_PARAMS`.

## Example URLs

```
/listings
/listings?property_type=land
/listings?transaction_type=for-sale
/listings?city=YE1101
/listings?property_type=buildings&city=YE2301&min_price=5000000
```

## Building links

Use `buildListingsUrl()` from `features/listings/lib/build-listings-url.ts`:

```ts
buildListingsUrl({ propertyTypeSlug: 'land', cityPcode: city.pcode });
```

Use in **CategoryNav**, **SearchPill**, carousels, footer — never hand-build `*_id=` query strings.

## Listings page flow (Aura_Tech pattern)

```
app/(marketplace)/listings/page.tsx     → Suspense + ListingsContent
ListingsContent (RSC)                   → read searchParams (slugs/pcodes)
resolveListingSearchParams()            → slug/pcode → id via catalog + lookup API
listingService.search({ ...ids })       → serverFetch → backend /listings/search
```

Reference: `Aura_Tech/app/(storefront)/products/page.tsx` (category slug → category_id).

## Resolution (`resolve-listing-search.ts`)

1. Try **public catalog** first (already loaded: cities, property types, transaction types).
2. Fallback **catalogLookupService** → backend public lookup:
   - `GET /property-types/public/slug/:slug`
   - `GET /transaction-types/public/slug/:slug`
   - `GET /property-subtypes/public/slug/:slug`
   - `GET /cities/public/pcode/:pcode`
   - `GET /neighborhoods/public/pcode/:neighbPcode`
3. Pass resolved ids to `listingService.search()` only — listing API unchanged.

## Do not

- Put `property_type_id`, `city_id`, etc. in user-facing URLs or `<Link href>`.
- Call listing search with slugs directly — backend listing search expects UUIDs.
- Resolve slugs in client components for initial page load — use RSC + `resolveListingSearchParams`.

## Related

- Architecture → [../architecture/SKILL.md](../architecture/SKILL.md)
- Server fetch → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
