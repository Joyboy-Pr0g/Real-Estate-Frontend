---
name: real-estate-frontend-platform-design
description: >-
  Real Estate UI: Bayut green light marketplace brand, admin gray shell, Tajawal,
  en/ar RTL, toasts, admin UI kit. Use when building pages, layouts, or admin
  components.
---

# Frontend Platform Design

## Brand

- Light marketplace — white/`surface`, Bayut green (`brand`, `#28B16D`), `primary-dark` text.
- **Not** Aura_Tech dark cyan theme — separate product visual.
- Typography: **Tajawal** in root `layout.tsx`.
- Cards: `rounded-2xl`, `shadow-[var(--shadow-soft)]`, hover `shadow-[var(--shadow-float)]`.

## Shells

| Surface | Layout | Chrome |
|---------|--------|--------|
| Marketplace | `(marketplace)/layout.tsx` | `SiteHeader` (auth menu) + main + `SiteFooter` |
| Admin | `(admin)/layout.tsx` | `AdminSidebar` + main on `bg-gray-50` |

Admin pages use `Container` with `py-8`; dashboard cards link to resources.

## UI kit (`components/ui/`)

| Component | Use |
|-----------|-----|
| `button.tsx` | Primary, outline, danger variants |
| `container.tsx` | Page width constraint |
| `dropdown-menu.tsx` | Radix — admin row actions (`UserActionsMenu`) |
| `admin-page-header.tsx` | Title, breadcrumb, count, filters slot |
| `toggle-pill.tsx` | Checkbox pill (e.g. include deleted) |
| `confirm-modal.tsx` | Destructive confirm dialogs |
| `toaster.tsx` | Global toasts — mounted in root `layout.tsx` |

Domain admin components live under `features/admin/components/<resource>/`.

## Toasts

```ts
import { toast } from '@/components/ui/toaster';

toast.success(t('admin.userActivated'));
toast.error(getErrorMessage(err));
```

Auto-dismiss ~4s; RTL-aware slide animation. Use in admin Panel/dialogs for mutation feedback.

## Admin list UI

- **Desktop:** `UserTable` — full columns, actions column right-aligned.
- **Mobile:** `UserCard` — stacked cards, same `UserActionsMenu`.
- **Actions:** `MoreHorizontal` trigger, `DropdownMenuContent align="end"`.
- **Badges:** `UserRoleBadge`, `UserStatusBadge` in `UserBadges.tsx`.
- **Filters:** inside `AdminPageHeader` filters slot — search input, selects, `TogglePill`, primary button.

## Motion

- Marketplace: `lib/motion/reveal.tsx`, carousel scroll, hero motion.
- Admin: minimal motion; toast uses framer-motion spring.

## i18n

- Default **Arabic** (`ar`); `useLocale()` in client, `getServerTranslations()` in RSC.
- Admin keys under `admin.*` in `lib/i18n/ar.ts` and `en.ts`.
- Logical properties (`start`/`end`, `ms-*`, `ps-*`) for RTL.

## Related skills

- Admin dashboard patterns → [../admin_dashboard/SKILL.md](../admin_dashboard/SKILL.md)
- Conventions → [../code_convention/SKILL.md](../code_convention/SKILL.md)
