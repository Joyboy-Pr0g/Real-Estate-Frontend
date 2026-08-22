---
name: real-estate-frontend-code-convention
description: >-
  Real Estate frontend coding conventions: kebab-case files, feature modules,
  admin Content/Panel/Table/Card naming, snake_case API fields, Server Components
  default. Use when adding components, services, or admin pages.
---

# Frontend Code Convention

## Naming

| Kind | Convention | Example |
|------|------------|--------|
| Files | kebab-case | `admin-users-panel.tsx`, `user-actions-menu.tsx` |
| Components | PascalCase export | `AdminUsersPanel`, `UserActionsMenu` |
| Functions | camelCase | `getAdminUsers`, `runAction` |
| API fields | snake_case | `deleted_at`, `phone_number`, `include_deleted` |
| URL query (admin) | snake_case | `?role=buyer&include_deleted=true` |

## Structure

- Domain UI in `features/<domain>/`.
- Admin resources: `features/admin/components/<resource>/` (e.g. `users/`).
- Shared primitives: `components/ui/`.
- Pages stay thin; fetch in RSC Content, not in `page.tsx` body.

## Admin component naming (required for new resources)

| Suffix | Purpose |
|--------|---------|
| `*Content` | Async RSC loader (`AdminUsersContent`) |
| `*Panel` | Client orchestrator (`AdminUsersPanel`) |
| `*Table` | Desktop list (`UserTable`) |
| `*Card` | Mobile list item (`UserCard`) |
| `*ActionsMenu` | Row dropdown (`UserActionsMenu`) |
| `*Dialog` / `*Modal` | Forms and confirms |

Full stack → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md).

## React / TypeScript

- Default Server Components; `'use client'` for Panel, Table, Card, ActionsMenu, modals, forms.
- Strict TS; interfaces aligned with backend DTOs.
- `cn()` from `lib/utils/cn.ts`.
- Forms: react-hook-form + zod (`features/auth/schemas/auth-schemas.ts`).

## Styling

- Tailwind; tokens in `app/globals.css`.
- Admin: white cards on `bg-gray-50`, green brand accents.
- Marketplace: light hero, search pill.

## Shared `lib/` — check before adding helpers

| Path | Use for |
|------|---------|
| `lib/utils/cn.ts` | Class merging |
| `lib/utils/format.ts` | `formatDateTime` |
| `lib/hooks/use-debounce.ts` | Admin filter debounce |
| `lib/api/endpoints.ts` | `backendPaths`, `bffPaths` |
| `lib/auth/session.ts` | `getSession`, `getAuthToken` |
| `lib/errors/api-error.ts` | `ApiError`, `getErrorMessage` |
| `lib/i18n/` | `t()`, locale, RTL |

## Do not

- Call `BACKEND_URL` from browser.
- Put fetch logic inside `*ActionsMenu` — callbacks only.
- Duplicate table/card action wiring — share `*ActionsMenu`.
- Read `request.json()` twice in BFF routes without re-wrapping body.
- Use `platform_admin` as assignable role in change-role UI (backend allows `buyer` | `office` only).
