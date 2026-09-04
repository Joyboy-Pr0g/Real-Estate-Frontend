'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Loader2, Plus, Search, Users } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/features/admin/components/users/CreateUserDialog';
import { ChangeRoleModal } from '@/features/admin/components/users/ChangeRoleModal';
import { UserCard } from '@/features/admin/components/users/UserCard';
import { UserTable } from '@/features/admin/components/users/UserTable';
import {
  activateUser,
  deactivateUser,
  hardDeleteUser,
  bulkDeleteUsers,
  loadMoreUsers,
  restoreUser,
  softDeleteUser,
  changeUserRole,
  changeUserPassword,
} from '@/features/auth/services/auth-service';
import {
  AdminUserListItem,
  AdminUsersPage,
  UserRole,
  UserStatus,
} from '@/features/auth/types/user';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { usePermissions } from '@/features/admin/providers/permissions-provider';

const ROLES: UserRole[] = ['buyer', 'office', 'platform_admin', 'sub_admin'];
const STATUSES: UserStatus[] = ['active', 'inactive', 'blocked'];
const PAGE_SIZE = 20;

interface AdminUsersPanelProps {
  initial: AdminUsersPage;
  initialRole?: UserRole;
  initialStatus?: UserStatus;
  initialSearch?: string;
  initialIncludeDeleted?: boolean;
}

type ConfirmAction = 'soft_delete' | 'hard_delete';

export function AdminUsersPanel({
  initial,
  initialRole,
  initialStatus,
  initialSearch = '',
  initialIncludeDeleted = false,
}: AdminUsersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [users, setUsers] = useState<AdminUserListItem[]>(initial.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [roleFilter, setRoleFilter] = useState(initialRole ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUserListItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('soft_delete');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserListItem | null>(null);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [canSelect, setCanSelect] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setUsers(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
    setSelected(new Set());
  }

  const applyFilters = useCallback(
    (role: string, status: string, search: string, deleted: boolean) => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      if (deleted) params.set('include_deleted', 'true');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(roleFilter, statusFilter, debouncedSearch, includeDeleted);
  }, [roleFilter, statusFilter, debouncedSearch, includeDeleted, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const runAction = async (
    userId: string,
    action: () => Promise<void>,
    options?: { closeRoleModal?: boolean; successMessage?: string },
  ) => {
    setActionUserId(userId);
    try {
      await action();
      refreshList();
      if (options?.successMessage) toast.success(options.successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionUserId(null);
      setConfirmOpen(false);
      setConfirmUser(null);
      if (options?.closeRoleModal) {
        setRoleChangeOpen(false);
        setRoleChangeUser(null);
      }
    }
  };

  const openConfirm = (user: AdminUserListItem, action: ConfirmAction) => {
    setConfirmUser(user);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const openRoleChange = (user: AdminUserListItem) => {
    setRoleChangeUser(user);
    setRoleChangeOpen(true);
  };

  const handleRoleChangeConfirm = (role: UserRole) => {
    if (!roleChangeUser || role === roleChangeUser.role || role === 'platform_admin') return;
    void runAction(roleChangeUser.id, () => changeUserRole(roleChangeUser.id, role), {
      closeRoleModal: true,
      successMessage: t('admin.roleChanged'),
    });
  };

  const closeRoleChangeModal = () => {
    setRoleChangeOpen(false);
    setRoleChangeUser(null);
  };

  const handleConfirm = () => {
    if (!confirmUser) return;
    if (confirmAction === 'hard_delete') {
      void runAction(confirmUser.id, () => hardDeleteUser(confirmUser.id), {
        successMessage: t('admin.userDeleted'),
      });
      return;
    }
    void runAction(confirmUser.id, () => softDeleteUser(confirmUser.id), {
      successMessage: t('admin.userSoftDeleted'),
    });
  };

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = {
        cursor: nextCursor,
        limit: String(PAGE_SIZE),
      };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (includeDeleted) params.include_deleted = 'true';

      const page = await loadMoreUsers(params);
      setUsers((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const fullName = (user: AdminUserListItem) => `${user.f_name} ${user.l_name}`.trim();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((user) => user.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const deleted = await bulkDeleteUsers([...selected]);
      toast.success(t('admin.bulkHardDeleted').replace('{count}', String(deleted)));
      setSelected(new Set());
      setBulkConfirmOpen(false);
      refreshList();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.users', icon: Users },
        ]}
        title={t('admin.users')}
        countLabel={t('admin.usersCount').replace('{count}', String(users.length))}
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute inset-s-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.searchUsers')}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
              >
                <option value="">{t('admin.allRoles')}</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`admin.role.${role}` as TranslationKey)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
              >
                <option value="">{t('admin.allStatuses')}</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`admin.status.${status}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-1">
              <TogglePill
                checked={includeDeleted}
                onCheckedChange={setIncludeDeleted}
                label={t('admin.includeDeleted')}
                icon={<Archive size={15} />}
              />

              <Button onClick={() => setCreateOpen(true)} className="rounded-xl" disabled={!hasPermission('users.create')}>
                <Plus size={16} />
                {t('admin.addUser')}
              </Button>

              {!canSelect ? (
                <Button type="button" variant="outline" onClick={() => setCanSelect(true)} className="hidden sm:block rounded-xl">
                  {t('admin.select')}
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setCanSelect(false)} className="hidden sm:block rounded-xl">
                  {t('admin.unSelect')}
                </Button>
              )}
            </div>
          </div>
        }
      />

      {selected.size > 0 && hasPermission('users.bulk_delete') ? (
          <Button variant="dangerOutline" onClick={() => void handleBulkDelete()} className="rounded-xl">
            {t('admin.deleteSelected').replace('{count}', String(selected.size))}
          </Button>
      ) : null}

      {users.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-var(--shadow-soft)">
          <p className="text-gray-500">{t('admin.noUsers')}</p>
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            actionUserId={actionUserId}
            selectedIds={selected}
            selectable={canSelect}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onActivate={(id) => void runAction(id, () => activateUser(id), { successMessage: t('admin.userActivated') })}
            onDeactivate={(id) => void runAction(id, () => deactivateUser(id), { successMessage: t('admin.userDeactivated') })}
            onChangeRole={openRoleChange}
            onChangePassword={(id) => void runAction(id, () => changeUserPassword(id), { successMessage: t('admin.passwordChanged') })}
            onSoftDelete={(user) => openConfirm(user, 'soft_delete')}
            onRestore={(id) => void runAction(id, () => restoreUser(id), { successMessage: t('admin.userRestored') })}
            onHardDelete={(user) => openConfirm(user, 'hard_delete')}
          />
          <div className="space-y-3 lg:hidden">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                actionUserId={actionUserId}
                onActivate={(id) => void runAction(id, () => activateUser(id), { successMessage: t('admin.userActivated') })}
                onDeactivate={(id) => void runAction(id, () => deactivateUser(id), { successMessage: t('admin.userDeactivated') })}
                onChangeRole={openRoleChange}
                onChangePassword={(id) => void runAction(id, () => changeUserPassword(id), { successMessage: t('admin.passwordChanged') })}
                onSoftDelete={(item) => openConfirm(item, 'soft_delete')}
                onRestore={(id) => void runAction(id, () => restoreUser(id), { successMessage: t('admin.userRestored') })}
                onHardDelete={(item) => openConfirm(item, 'hard_delete')}
              />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending} className="rounded-xl">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}

      {confirmUser ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmTitle').replace('{name}', fullName(confirmUser))}
          description={
            confirmAction === 'hard_delete'
              ? t('admin.confirmHardDelete').replace('{name}', fullName(confirmUser))
              : t('admin.confirmSoftDelete').replace('{name}', fullName(confirmUser))
          }
          confirmText={confirmAction === 'hard_delete' ? t('admin.deleteUser') : t('admin.softDeleteUser')}
          cancelText={t('admin.cancel')}
          loading={actionUserId === confirmUser.id}
          danger
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmUser(null);
          }}
          onConfirm={handleConfirm}
        />
      ) : null}

      <ConfirmModal
        open={bulkConfirmOpen}
        title={t('admin.confirmBulkHardDeleteTitle')}
        description={t('admin.confirmBulkHardDeleteDescription').replace('{count}', String(selected.size))}
        confirmText={t('admin.hardDelete')}
        cancelText={t('admin.cancel')}
        danger
        loading={bulkDeleting}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => void handleBulkDelete()}
      />

      <ChangeRoleModal
        open={roleChangeOpen}
        user={roleChangeUser}
        loading={roleChangeUser ? actionUserId === roleChangeUser.id : false}
        onCancel={closeRoleChangeModal}
        onConfirm={handleRoleChangeConfirm}
      />

      <CreateUserDialog
        open={createOpen && hasPermission('users.create')}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshList}
      />
    </div>
  );
}
