'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, KeyRound, Pencil, Plus, Shield, Trash2, UserCog } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  PermissionFormPayload,
  PermissionRecord,
  SubAdminPermissionAssignment,
} from '@/features/admin/types/permission';
import {
  assignPermissionsBulk,
  createPermission,
  deletePermission,
  fetchAllPermissions,
  fetchPermissionAssignments,
  fetchUserAssignedPermissionIds,
  removePermission,
  removeUserAssignment,
  searchPermissions,
  searchSubAdmins,
  updatePermission,
} from '@/features/admin/services/permission-service';
import { cn } from '@/lib/utils/cn';

interface AdminPermissionsPanelProps {
  initialAssignments: SubAdminPermissionAssignment[];
  allPermissions: PermissionRecord[];
  initialUserId?: string;
  initialPermissionId?: string;
}

const EMPTY_FORM: PermissionFormPayload = {
  name: '',
  display_name: '',
  resource: '',
  action: '',
  path: '/admin',
};

const collapseTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

function CollapsibleContent({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={collapseTransition}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  badge,
  headerAction,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-var(--shadow-soft)">
      <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-3 text-start transition-colors hover:opacity-80"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-primary-dark">{title}</span>
              {badge}
            </span>
            {description ? <p className="mt-0.5 text-sm text-gray-500">{description}</p> : null}
          </span>
          <ChevronDown
            className={cn(
              'mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>

      <CollapsibleContent open={open}>
        <div className="space-y-4 p-4">{children}</div>
      </CollapsibleContent>
    </section>
  );
}

function ResourcePermissionGroup({
  resource,
  count,
  defaultOpen = true,
  children,
}: {
  resource: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="sticky top-0 z-10 flex w-full items-center gap-2 bg-gray-50 px-3 py-2 text-start transition-colors hover:bg-gray-100/80"
      >
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{resource}</span>
        <span className="ms-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {count}
        </span>
      </button>
      <CollapsibleContent open={open}>{children}</CollapsibleContent>
    </div>
  );
}

function PermissionFormModal({
  open,
  mode,
  editingId,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  editingId?: string;
  initial: PermissionFormPayload;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PermissionFormPayload>(initial);

  if (!open) return null;

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createPermission(form);
          toast.success(t('admin.permissions.created'));
        } else if (editingId) {
          await updatePermission(editingId, form);
          toast.success(t('admin.permissions.updated'));
        }
        onSaved();
        onClose();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-var(--shadow-float)">
        <h2 className="text-lg font-bold text-primary-dark">
          {mode === 'create' ? t('admin.permissions.createTitle') : t('admin.permissions.editTitle')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{t('admin.permissions.formHint')}</p>

        <div className="mt-5 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-500">{t('admin.permissions.fieldName')}</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="users.view"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-500">{t('admin.permissions.fieldDisplayName')}</span>
            <input
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.permissions.fieldResource')}</span>
              <input
                value={form.resource}
                onChange={(e) => setForm({ ...form, resource: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-500">{t('admin.permissions.fieldAction')}</span>
              <input
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-500">{t('admin.permissions.fieldPath')}</span>
            <input
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="/admin/users"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            {t('admin.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {t('admin.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssignPermissionsSection({
  allPermissions,
  initialUserId,
  onAssigned,
}: {
  allPermissions: PermissionRecord[];
  initialUserId?: string;
  onAssigned: () => void;
}) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = useState(initialUserId ?? '');
  const [userLabel, setUserLabel] = useState('');
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignedLoadedForUserId, setAssignedLoadedForUserId] = useState<string | null>(null);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [removeAllOpen, setRemoveAllOpen] = useState(false);
  const [removeAllPending, setRemoveAllPending] = useState(false);

  const filteredPermissions = useMemo(() => {
    const term = permissionSearch.trim().toLowerCase();
    if (!term) return allPermissions;

    return allPermissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(term) ||
        permission.display_name.toLowerCase().includes(term) ||
        permission.resource.toLowerCase().includes(term),
    );
  }, [allPermissions, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionRecord[]>();
    for (const permission of filteredPermissions) {
      const list = groups.get(permission.resource) ?? [];
      list.push(permission);
      groups.set(permission.resource, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPermissions]);

  const loadAssignedForUser = useCallback((targetUserId: string) => {
    void fetchUserAssignedPermissionIds(targetUserId)
      .then((ids) => {
        setAssignedIds(new Set(ids));
        setSelectedIds(new Set());
        setAssignedLoadedForUserId(targetUserId);
      })
      .catch(() => {
        setAssignedIds(new Set());
        setSelectedIds(new Set());
        setAssignedLoadedForUserId(targetUserId);
      });
  }, []);

  useEffect(() => {
    if (initialUserId) {
      loadAssignedForUser(initialUserId);
    }
  }, [initialUserId, loadAssignedForUser]);

  const loadingAssigned = Boolean(userId && assignedLoadedForUserId !== userId);

  const handleUserChange = (id: string, label: string) => {
    setUserId(id);
    setUserLabel(label);
    setPermissionSearch('');
    if (!id) {
      setAssignedIds(new Set());
      setSelectedIds(new Set());
      setAssignedLoadedForUserId(null);
      return;
    }
    setAssignedLoadedForUserId(null);
    loadAssignedForUser(id);
  };

  const togglePermission = (permissionId: string) => {
    if (assignedIds.has(permissionId)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleAssign = () => {
    if (!userId || selectedIds.size === 0) return;
    startTransition(async () => {
      try {
        const result = await assignPermissionsBulk({
          user_id: userId,
          permission_ids: [...selectedIds],
        });
        if (result.assigned_count > 0) {
          toast.success(
            t('admin.permissions.assignedBulk').replace('{count}', String(result.assigned_count)),
          );
        } else {
          toast.success(t('admin.permissions.alreadyAssignedAll'));
        }
        const ids = await fetchUserAssignedPermissionIds(userId);
        setAssignedIds(new Set(ids));
        setSelectedIds(new Set());
        setAssignedLoadedForUserId(userId);
        onAssigned();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const handleRemoveAll = async () => {
    if (!userId) return;
    setRemoveAllPending(true);
    try {
      const result = await removeUserAssignment(userId);
      toast.success(
        t('admin.permissions.removedAllCount').replace('{count}', String(result.removed_count)),
      );
      setAssignedIds(new Set());
      setSelectedIds(new Set());
      setAssignedLoadedForUserId(userId);
      setRemoveAllOpen(false);
      onAssigned();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRemoveAllPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-var(--shadow-soft)">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand-dark">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-primary-dark">{t('admin.permissions.assignTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('admin.permissions.assignHint')}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <span className="text-xs font-medium text-gray-500">{t('admin.permissions.subAdmin')}</span>
        <SearchableSelect
          value={userId}
          selectedLabel={userLabel}
          onChange={handleUserChange}
          fetchOptions={searchSubAdmins}
          placeholder={t('admin.permissions.selectSubAdmin')}
        />
      </div>

      {!userId ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          {t('admin.permissions.selectSubAdminFirst')}
        </p>
      ) : loadingAssigned ? (
        <p className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          {t('admin.permissions.loadingAssigned')}
        </p>
      ) : allPermissions.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          {t('admin.permissions.noPermissionsToAssign')}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-primary-dark">{t('admin.permissions.selectPermissions')}</p>
              <p className="text-xs text-gray-500">{t('admin.permissions.selectPermissionsHint')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {assignedIds.size > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemoveAllOpen(true)}
                  disabled={pending || removeAllPending}
                  className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('admin.permissions.removeAll')}
                </Button>
              ) : null}
              {selectedIds.size > 0 ? (
                <span className="rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand-dark">
                  {t('admin.permissions.selectedCount').replace('{count}', String(selectedIds.size))}
                </span>
              ) : null}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-500">{t('admin.permissions.searchPermissions')}</span>
            <input
              type="search"
              value={permissionSearch}
              onChange={(event) => setPermissionSearch(event.target.value)}
              placeholder={t('admin.permissions.searchPermissionsPlaceholder')}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
            />
          </label>

          {groupedPermissions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              {t('admin.permissions.noSearchResults')}
            </p>
          ) : (
          <div className="max-h-105 overflow-y-auto rounded-xl border border-gray-100">
            {groupedPermissions.map(([resource, items]) => (
              <ResourcePermissionGroup
                key={`${resource}-${permissionSearch}`}
                resource={resource}
                count={items.length}
                defaultOpen
              >
                <ul className="divide-y divide-gray-50 border-t border-gray-100">
                  {items.map((permission) => {
                    const isAssigned = assignedIds.has(permission.id);
                    const isSelected = selectedIds.has(permission.id);
                    return (
                      <li key={permission.id}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-3 px-3 py-3 transition-colors',
                            isAssigned
                              ? 'cursor-default bg-emerald-50/60'
                              : isSelected
                                ? 'bg-brand-muted/40'
                                : 'hover:bg-gray-50/80',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned || isSelected}
                            disabled={isAssigned || pending}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark disabled:opacity-70"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-primary-dark">{permission.display_name}</span>
                              {isAssigned ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                  <Check className="h-3 w-3" />
                                  {t('admin.permissions.alreadyAssigned')}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500">
                              {permission.name} · {permission.path}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </ResourcePermissionGroup>
            ))}
          </div>
          )}

          <div className="flex justify-end">
            <Button type="button" onClick={handleAssign} disabled={pending || selectedIds.size === 0}>
              {t('admin.permissions.assignAction')}
            </Button>
          </div>
        </div>
      )}

      {removeAllOpen ? (
        <ConfirmModal
          open={removeAllOpen}
          title={t('admin.permissions.removeAllTitle').replace('{name}', userLabel || userId)}
          description={t('admin.permissions.removeAllHint')}
          confirmText={t('admin.permissions.removeAll')}
          cancelText={t('admin.cancel')}
          loading={removeAllPending}
          danger
          onCancel={() => setRemoveAllOpen(false)}
          onConfirm={() => void handleRemoveAll()}
        />
      ) : null}
    </div>
  );
}

export function AdminPermissionsPanel({
  initialAssignments,
  allPermissions: initialPermissions,
  initialUserId,
  initialPermissionId,
}: AdminPermissionsPanelProps) {
  const { t } = useLocale();
  const [permissions, setPermissions] = useState(initialPermissions);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [filterUserId, setFilterUserId] = useState(initialUserId ?? '');
  const [filterUserLabel, setFilterUserLabel] = useState('');
  const [filterPermissionId, setFilterPermissionId] = useState(initialPermissionId ?? '');
  const [filterPermissionLabel, setFilterPermissionLabel] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitial, setFormInitial] = useState<PermissionFormPayload>(EMPTY_FORM);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PermissionRecord | null>(null);
  const [clearAllTarget, setClearAllTarget] = useState<SubAdminPermissionAssignment | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [clearAllPending, setClearAllPending] = useState(false);
  const [collapsedAssignments, setCollapsedAssignments] = useState<Set<string>>(new Set());
  const [collapsedResources, setCollapsedResources] = useState<Set<string>>(new Set());

  const toggleAssignment = (userId: string) => {
    setCollapsedAssignments((current) => {
      const next = new Set(current);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleResource = (resource: string) => {
    setCollapsedResources((current) => {
      const next = new Set(current);
      if (next.has(resource)) {
        next.delete(resource);
      } else {
        next.add(resource);
      }
      return next;
    });
  };

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionRecord[]>();
    for (const permission of permissions) {
      const list = groups.get(permission.resource) ?? [];
      list.push(permission);
      groups.set(permission.resource, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const refreshPermissions = useCallback(async () => {
    const data = await fetchAllPermissions();
    setPermissions(data);
  }, []);

  const refreshAssignments = useCallback(async () => {
    const data = await fetchPermissionAssignments({
      user_id: filterUserId || undefined,
      permission_id: filterPermissionId || undefined,
    });
    setAssignments(data);
  }, [filterPermissionId, filterUserId]);

  const openCreateForm = () => {
    setFormMode('create');
    setEditingPermissionId(null);
    setFormInitial(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (permission: PermissionRecord) => {
    setFormMode('edit');
    setEditingPermissionId(permission.id);
    setFormInitial({
      name: permission.name,
      display_name: permission.display_name,
      resource: permission.resource,
      action: permission.action,
      path: permission.path,
    });
    setFormOpen(true);
  };

  const handleDeletePermission = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deletePermission(deleteTarget.id);
      toast.success(t('admin.permissions.deleted'));
      setDeleteTarget(null);
      await Promise.all([refreshPermissions(), refreshAssignments()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletePending(false);
    }
  };

  const handleRemoveAssignment = (userId: string, permissionId: string) => {
    const key = `${userId}:${permissionId}`;
    setPendingKey(key);
    void (async () => {
      try {
        await removePermission({ user_id: userId, permission_id: permissionId });
        toast.success(t('admin.permissions.removed'));
        await refreshAssignments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingKey(null);
      }
    })();
  };

  const handleRemoveAllAssignments = async () => {
    if (!clearAllTarget) return;
    setClearAllPending(true);
    try {
      const result = await removeUserAssignment(clearAllTarget.user_id);
      toast.success(
        t('admin.permissions.removedAllCount').replace('{count}', String(result.removed_count)),
      );
      setClearAllTarget(null);
      await refreshAssignments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setClearAllPending(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.permissions.nav', icon: Shield },
        ]}
        title={t('admin.permissions.title')}
        countLabel={`${permissions.length} ${t('admin.permissions.definitionsCount')}`}
      />

      <CollapsibleSection
        title={t('admin.permissions.assignmentsTitle')}
        description={t('admin.permissions.assignmentsHint')}
        badge={
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {assignments.length}
          </span>
        }
        defaultOpen={false}
      >
        <AssignPermissionsSection
          allPermissions={permissions}
          initialUserId={initialUserId}
          onAssigned={() => void refreshAssignments()}
        />

        <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">{t('admin.permissions.filterUser')}</span>
                <SearchableSelect
                  value={filterUserId}
                  selectedLabel={filterUserLabel}
                  onChange={(id, label) => {
                    setFilterUserId(id);
                    setFilterUserLabel(label);
                  }}
                  fetchOptions={searchSubAdmins}
                  placeholder={t('admin.permissions.allSubAdmins')}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">{t('admin.permissions.filterPermission')}</span>
                <SearchableSelect
                  value={filterPermissionId}
                  selectedLabel={filterPermissionLabel}
                  onChange={(id, label) => {
                    setFilterPermissionId(id);
                    setFilterPermissionLabel(label);
                  }}
                  fetchOptions={searchPermissions}
                  placeholder={t('admin.permissions.allPermissions')}
                />
              </div>
            </div>
            <Button type="button" onClick={() => void refreshAssignments()}>
              {t('admin.permissions.applyFilters')}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
              {t('admin.permissions.empty')}
            </div>
          ) : (
            assignments.map((assignment) => {
              const isOpen = !collapsedAssignments.has(assignment.user_id);
              return (
                <article
                  key={assignment.user_id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleAssignment(assignment.user_id)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-3 text-start transition-colors hover:opacity-80"
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                      />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand-dark">
                        <UserCog className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-primary-dark">
                          {assignment.f_name} {assignment.l_name}
                        </p>
                        <p className="truncate text-sm text-gray-500">{assignment.email}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {assignment.permissions.length} {t('admin.permissions.countLabel')}
                      </span>
                    </button>
                    {assignment.permissions.length > 0 ? (
                      <button
                        type="button"
                        disabled={clearAllPending}
                        onClick={() => setClearAllTarget(assignment)}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('admin.permissions.removeAll')}
                      </button>
                    ) : null}
                  </div>

                  <CollapsibleContent open={isOpen}>
                    {assignment.permissions.length === 0 ? (
                      <p className="border-t border-gray-100 px-4 py-6 text-sm text-gray-500">
                        {t('admin.permissions.noPermissions')}
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-50 border-t border-gray-100">
                        {assignment.permissions.map((permission) => {
                          const key = `${assignment.user_id}:${permission.id}`;
                          const isPending = pendingKey === key;
                          return (
                            <li
                              key={permission.id}
                              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-primary-dark">{permission.display_name}</p>
                                <p className="text-xs text-gray-500">
                                  {permission.name} · {permission.path}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleRemoveAssignment(assignment.user_id, permission.id)}
                                className={cn(
                                  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50',
                                )}
                                aria-label={t('admin.permissions.remove')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CollapsibleContent>
                </article>
              );
            })
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('admin.permissions.definitionsTitle')}
        description={t('admin.permissions.definitionsHint')}
        badge={
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {permissions.length}
          </span>
        }
        headerAction={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            {t('admin.permissions.createAction')}
          </Button>
        }
        defaultOpen={false}
      >
        {permissions.length === 0 ? (
          <p className="px-2 py-12 text-center text-sm text-gray-500">{t('admin.permissions.noDefinitions')}</p>
        ) : (
          <div className="space-y-3">
            {groupedPermissions.map(([resource, items]) => {
              const isOpen = !collapsedResources.has(resource);
              return (
                <div key={resource} className="overflow-hidden rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleResource(resource)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 bg-gray-50 px-4 py-2.5 text-start transition-colors hover:bg-gray-100/80"
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{resource}</span>
                    <span className="ms-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {items.length}
                    </span>
                  </button>

                  <CollapsibleContent open={isOpen}>
                    <ul className="divide-y divide-gray-50">
                      {items.map((permission) => (
                        <li
                          key={permission.id}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-primary-dark">{permission.display_name}</p>
                            <p className="text-xs text-gray-500">
                              {permission.name} · {permission.action} · {permission.path}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditForm(permission)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-dark"
                            aria-label={t('admin.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(permission)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={t('admin.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      <PermissionFormModal
        key={editingPermissionId ?? 'create'}
        open={formOpen}
        mode={formMode}
        editingId={editingPermissionId ?? undefined}
        initial={formInitial}
        onClose={() => setFormOpen(false)}
        onSaved={() => void Promise.all([refreshPermissions(), refreshAssignments()])}
      />

      {deleteTarget ? (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title={t('admin.permissions.deleteTitle').replace('{name}', deleteTarget.display_name)}
          description={t('admin.permissions.deleteHint')}
          confirmText={t('admin.delete')}
          cancelText={t('admin.cancel')}
          loading={deletePending}
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleDeletePermission()}
        />
      ) : null}

      {clearAllTarget ? (
        <ConfirmModal
          open={Boolean(clearAllTarget)}
          title={t('admin.permissions.removeAllTitle').replace(
            '{name}',
            `${clearAllTarget.f_name} ${clearAllTarget.l_name}`.trim(),
          )}
          description={t('admin.permissions.removeAllHint')}
          confirmText={t('admin.permissions.removeAll')}
          cancelText={t('admin.cancel')}
          loading={clearAllPending}
          danger
          onCancel={() => setClearAllTarget(null)}
          onConfirm={() => void handleRemoveAllAssignments()}
        />
      ) : null}
    </div>
  );
}

export function AdminPermissionsPanelWithSuspense(props: AdminPermissionsPanelProps) {
  return (
    <Suspense fallback={null}>
      <AdminPermissionsPanel {...props} />
    </Suspense>
  );
}
