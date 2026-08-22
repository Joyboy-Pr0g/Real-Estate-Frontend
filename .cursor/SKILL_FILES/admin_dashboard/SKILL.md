---
name: real-estate-frontend-admin-dashboard
description: >-
  Admin dashboard patterns for Real Estate frontend: Content/Panel split, resource
  subfolders (UserTable, UserCard, ActionsMenu), server fetch + client mutations,
  BFF routes, toasts, modals, URL filters. Use when building or changing admin
  pages under app/(admin)/, features/admin/, or /api/admin/*.
---

# Admin Dashboard

Reference implementation: **`/admin/users`** — copy this stack for every new admin resource.

## Page stack (required)

```
app/(admin)/admin/<resource>/page.tsx     # Thin: Container, Suspense, skeleton
features/admin/components/<resource>/
  <Resource>Content.tsx                   # async RSC: parse searchParams, server fetch
  <Resource>Panel.tsx                     # 'use client': filters, state, mutations
  <Resource>Table.tsx                     # lg+ desktop table (hidden on mobile)
  <Resource>Card.tsx                      # < lg mobile cards (hidden on desktop)
  <Resource>ActionsMenu.tsx               # DropdownMenu row actions (MoreHorizontal)
  *Dialog.tsx / *Modal.tsx                # Create, confirm, role change, etc.
features/admin/services/
  <resource>-service.ts                   # serverFetch + getAuthToken (initial load)
features/auth/services/
  auth-service.ts                         # clientFetch mutations (admin user actions)
app/api/admin/**/route.ts                 # BFF: zod validate → proxyToBackend
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| `page.tsx` | Route only. `Container`, `<Suspense fallback={Skeleton}>`, pass `searchParams` promise to Content. |
| `*Content.tsx` | Server Component. Await `searchParams`, call `*-service.ts`, pass `initial` + filter props to Panel. |
| `*Panel.tsx` | Client orchestrator: filters → URL, `router.refresh()` after mutations, modals, load-more, toasts. |
| `*Table.tsx` / `*Card.tsx` | Presentational + wire callbacks. Same data, responsive split (`hidden lg:block` / `lg:hidden`). |
| `*ActionsMenu.tsx` | Per-row `DropdownMenu` from `components/ui/dropdown-menu.tsx`. Callbacks only — no fetch inside. |

## Users reference (canonical)

```
app/(admin)/admin/users/page.tsx
  → AdminUsersContent
  → AdminUsersPanel
  → UserTable + UserCard (mapped)
  → UserActionsMenu (inside Table/Card)
  → CreateUserDialog, ChangeRoleModal, ConfirmModal
```

**Server load:** `getAdminUsers()` in `features/admin/services/admin-users-service.ts`  
**Mutations:** `features/auth/services/auth-service.ts` → `bffPaths.admin.*`  
**Types:** `features/auth/types/user.ts` (`AdminUserListItem`, `AdminUsersPage`, …)

## Panel patterns

### URL-synced filters

- Debounced search: `useDebounce(searchInput, 400)` + `useRef` skip on first render.
- On filter change: build `URLSearchParams`, `router.push(pathname?query)`, `router.refresh()`.
- Delete `cursor` when filters change so list resets.

### `runAction` helper

Centralize mutation UX in the Panel:

```ts
const runAction = async (id: string, action: () => Promise<void>, options?: {
  successMessage?: string;
  closeRoleModal?: boolean;
}) => {
  setActionUserId(id);
  try {
    await action();
    refreshList(); // startTransition(() => router.refresh())
    if (options?.successMessage) toast.success(options.successMessage);
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    setActionUserId(null);
    // close modals…
  }
};
```

- Pass `actionUserId` to Table/Card/ActionsMenu to disable row menu while pending.
- Destructive actions → open `ConfirmModal` first; non-destructive → call `runAction` directly.
- Role change → dedicated modal (`ChangeRoleModal`) with assignable roles only (`buyer` | `office`, never `platform_admin`).

### Load more (cursor)

- Keep `nextCursor` / `hasMore` in Panel state; append via `loadMoreUsers()` / client service.
- Initial page always from RSC Content; cursor pagination is client-only append.

### Sync `initial` from RSC into Panel state (required — React 19)

Panels hold **local list state** (`items`, `users`, cursor fields) because load-more **appends** on the client. After `router.refresh()`, Content passes a new `initial` prop — the Panel must reset local state to match.

**Do not** reset with `useEffect` + `setState`. React 19 warns: *"Calling setState synchronously within an effect can trigger cascading renders"*.

```ts
// ❌ Wrong — triggers React 19 warning
useEffect(() => {
  setItems(initial.items);
  setNextCursor(initial.next_cursor);
  setHasMore(initial.has_more);
}, [initial]);
```

**Do** adjust state **during render** when `initial` changes ([React docs — adjust state when props change](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)):

```ts
const [items, setItems] = useState(initial.items);
const [nextCursor, setNextCursor] = useState<string | null>(initial.next_cursor);
const [hasMore, setHasMore] = useState(initial.has_more);

const [prevInitial, setPrevInitial] = useState(initial);
if (initial !== prevInitial) {
  setPrevInitial(initial);
  setItems(initial.items);
  setNextCursor(initial.next_cursor);
  setHasMore(initial.has_more);
}
```

For a **flat array** `initial` (no cursor page object):

```ts
const [items, setItems] = useState(initial);
const [prevInitial, setPrevInitial] = useState(initial);
if (initial !== prevInitial) {
  setPrevInitial(initial);
  setItems(initial);
}
```

Reference: `AdminUsersPanel.tsx`, `AdminCitiesPanel.tsx`, `AdminPropertyTypesPanel.tsx`.

**Sidebar / localStorage / route changes:** same rule — no synchronous `setState` in effects.

```ts
// ❌ Wrong — localStorage hydrate in effect
useEffect(() => {
  if (localStorage.getItem(KEY) === 'true') setCompact(true);
}, []);

// ✅ Lazy initial state (client-only read)
const [compact, setCompact] = useState(() => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === 'true';
});

// ❌ Wrong — close drawer when route changes
useEffect(() => {
  setOpen(false);
}, [pathname]);

// ✅ Sync during render when pathname changes
const [prevPathname, setPrevPathname] = useState(pathname);
if (pathname !== prevPathname) {
  setPrevPathname(pathname);
  setOpen(false);
}
```

Effects are still fine for **subscriptions** (Escape key, `document.body.style`, listeners) where `setState` runs only inside event callbacks.

**Do not** suppress or disable this warning — fix the pattern instead.

### Header + filters

Use `AdminPageHeader` (`components/ui/admin-page-header.tsx`):

- `breadcrumbItems`, `title`, `countLabel`, `filters` slot (search, selects, `TogglePill`, primary CTA).

## ActionsMenu pattern

- Trigger: `MoreHorizontal` icon button, `DropdownMenuTrigger` + `DropdownMenuContent align="end"`.
- Props: entity row + `onActivate`, `onDeactivate`, `onSoftDelete`, … (callbacks, not IDs+fetch).
- Panel binds: `onActivate={() => runAction(user.id, () => activateUser(user.id), { successMessage: t('…') })}`.
- Conditional items by entity state (`deleted_at`, `status === 'active'`, etc.).

## Responsive table / card

| Viewport | Component | Wrapper class |
|----------|-----------|---------------|
| `lg+` | `*Table.tsx` | `hidden lg:block` on outer card |
| `< lg` | `*Card.tsx` | `space-y-3 lg:hidden`; map in Panel |

Do not duplicate action logic — both use the same `*ActionsMenu`.

## Modals

| Modal | Use |
|-------|-----|
| `ConfirmModal` | Soft delete, hard delete |
| `ChangeRoleModal` | Select new role before PATCH |
| `CreateUserDialog` | Create form (admin POST) |

Shared UI: `components/ui/confirm-modal.tsx`, domain modals under `features/admin/components/<resource>/`.

### Edit form dialogs — partial update (required)

On **edit**, send **only changed fields** in the PUT/PATCH body. On **create**, send the full payload.

- Compare form state to the loaded `item` before calling the update client.
- Use `buildPartialUpdate()` from `features/admin/lib/partial-update.ts`.
- For nested objects (e.g. `spec_schema`), pass a custom equality fn — see `specSchemasEqual()` in `features/admin/lib/spec-schema-builder.ts`.
- If nothing changed, show `toast.info(t('admin.noChanges'))` and skip the API call.
- Update client functions should accept `Partial<Payload>` (e.g. `PropertySubtypeUpdatePayload`).

```ts
if (item) {
  const next = { name: name.trim(), icon: icon.trim(), spec_schema };
  const original = { name: item.name, icon: item.icon, spec_schema: item.spec_schema };
  const patch = buildPartialUpdate(next, original, { spec_schema: specSchemasEqual });

  if (!hasPartialChanges(patch)) {
    toast.info(t('admin.noChanges'));
    return;
  }

  await updatePropertySubtype(item.id, patch);
} else {
  await createPropertySubtype(fullPayload);
}
```

Reference: `PropertySubtypeFormDialog`, `PropertyTypeFormDialog`, `TransactionTypeFormDialog`.

## Toasts

- Global: `<Toaster />` in root `app/layout.tsx`.
- Import: `import { toast } from '@/components/ui/toaster'`.
- Use `toast.success` / `toast.error` in Panel and dialogs; use `getErrorMessage(err)` for errors.
- Add i18n keys under `admin.*` in `lib/i18n/ar.ts` and `en.ts`.

## BFF routes (`app/api/admin/**`)

| Pattern | When |
|---------|------|
| GET with query | Validate with zod → `proxyToBackend` + `searchParams` |
| PATCH/POST with body | Validate → **re-wrap body** in new `NextRequest` before `proxyToBackend` |
| PUT `[id]` update | Validate with **`.partial()`** zod schema — only changed fields from the client |

**Critical:** Never call `request.json()` then pass the same `request` to `proxyToBackend` — the body stream is consumed once. Pattern:

```ts
const body = await request.json();
const parsed = schema.safeParse(body);
// …
return proxyToBackend(
  new NextRequest(request.url, {
    method: 'PATCH',
    headers: request.headers,
    body: JSON.stringify(parsed.data),
  }),
  { path: backendPaths.auth.changeUserRole(userId), method: 'PATCH' },
);
```

See `app/api/admin/users/route.ts` (POST) and `change-role/route.ts` (PATCH).

## Auth & access

- `(admin)/layout.tsx`: `getSession()` → redirect if not `platform_admin`.
- Server services: pass `token` from `getAuthToken()` to `serverFetch`.
- Client mutations: `clientFetch` with `credentials: 'include'` (httpOnly cookie).

## Adding a new admin resource (checklist)

1. Backend route + types aligned in `features/<domain>/types/`.
2. `backendPaths` + `bffPaths` in `lib/api/endpoints.ts`.
3. `features/admin/services/<resource>-service.ts` for RSC initial load.
4. Client mutations in `auth-service.ts` or dedicated `*-client.ts` if not auth-related.
5. Zod schemas in `features/auth/schemas/auth-schemas.ts` (or domain schemas).
6. BFF routes under `app/api/admin/`.
7. `app/(admin)/admin/<resource>/page.tsx` + Content + Panel.
8. Split `*Table`, `*Card`, `*ActionsMenu`; add modals as needed.
9. i18n keys (`admin.*`) + toast success/error messages.
10. Link from `app/(admin)/admin/page.tsx` dashboard cards.

## File naming

| Kind | Pattern | Example |
|------|---------|---------|
| RSC loader | `<Resource>Content.tsx` | `AdminUsersContent.tsx` |
| Client shell | `<Resource>Panel.tsx` | `AdminUsersPanel.tsx` |
| Desktop list | `<Resource>Table.tsx` | `UserTable.tsx` |
| Mobile list | `<Resource>Card.tsx` | `UserCard.tsx` |
| Row menu | `<Resource>ActionsMenu.tsx` | `UserActionsMenu.tsx` |
| Badges | `<Resource>Badges.tsx` or shared | `UserBadges.tsx` |

Place all under `features/admin/components/<resource>/` (e.g. `users/`, future `listings/`).

## Related skills

- Architecture overview → [../architecture/SKILL.md](../architecture/SKILL.md)
- Fetch & BFF → [../server_client_fetch/SKILL.md](../server_client_fetch/SKILL.md)
- Services → [../services/SKILL.md](../services/SKILL.md)
- Security / cookies → [../security/SKILL.md](../security/SKILL.md)
- UI shell & toasts → [../platform_design/SKILL.md](../platform_design/SKILL.md)
