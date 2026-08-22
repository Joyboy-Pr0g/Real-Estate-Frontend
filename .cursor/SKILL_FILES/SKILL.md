---
name: real-estate-frontend
description: >-
  Index of Real Estate Marketplace Next.js frontend project skills. Use when
  working on the Yemen marketplace UI, admin dashboard, BFF API routes, auth,
  fetch helpers, services, security, or design system. Read the matching topic
  skill before changing code.
---

# Real Estate Frontend — Skill Index

Yemen-focused marketplace + **platform admin dashboard**, built with **Next.js App Router**, TypeScript, Tailwind (Bayut green brand), and a BFF that proxies to the Node backend. Dev server: port **3001** (backend **3000**).

Before implementing or reviewing frontend work, open the topic skill that matches the task:

| Skill | Path | Use when |
|-------|------|----------|
| Overview | [overview/SKILL.md](overview/SKILL.md) | Onboarding, stack, folders, routes |
| Architecture | [architecture/SKILL.md](architecture/SKILL.md) | Page stack, RSC + client islands, BFF layout |
| **Admin dashboard** | [admin_dashboard/SKILL.md](admin_dashboard/SKILL.md) | **Admin pages: Content/Panel, Table/Card, ActionsMenu, modals, BFF mutations** |
| Code convention | [code_convention/SKILL.md](code_convention/SKILL.md) | Naming, features layout, TS style, lib reuse |
| Security | [security/SKILL.md](security/SKILL.md) | Auth cookies, BFF secrets, env vars |
| Services | [services/SKILL.md](services/SKILL.md) | Feature services, endpoints map, auth-service |
| Server / client fetch | [server_client_fetch/SKILL.md](server_client_fetch/SKILL.md) | `serverFetch`, `clientFetch`, BFF routes |
| Search URL params | [search_url_params/SKILL.md](search_url_params/SKILL.md) | Slugs/pcodes in URLs, listing search |
| Platform design | [platform_design/SKILL.md](platform_design/SKILL.md) | Brand, shells, UI kit, i18n, toasts |

Reference project: **`Aura_Tech`** — same fetch/service/BFF patterns; different visual theme (dark vs Bayut light).

Backend skills: sibling repo `Real-Estate/.cursor/SKILL_FILES/` (if present).

## Quick rules

1. Browser never calls `BACKEND_URL` — only `/api/*` via `clientFetch` or RSC via `serverFetch`.
2. **Initial page data is always fetched in Server Components** via feature services. Never `useEffect` + `clientFetch` for first paint.
3. Domain logic lives under `features/<domain>/`; thin pages in `app/`.
4. Prefer Server Components; `'use client'` for interactivity (carousels, modals, forms, admin panels).
5. Match snake_case API fields; kebab-case file names.
6. Align types with backend DTOs.
7. Listing filter URLs use slugs/pcodes — see [search_url_params/SKILL.md](search_url_params/SKILL.md).
8. Check `lib/` for existing helpers before adding inline utilities.
9. **Admin CRUD pages:** follow [admin_dashboard/SKILL.md](admin_dashboard/SKILL.md) (Content → Panel → Table/Card/ActionsMenu).
10. **BFF routes that validate JSON body:** re-wrap parsed body in a new `NextRequest` before `proxyToBackend` (body stream is single-use).
