'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { PropertyTypeCard } from '@/features/admin/components/property-types/PropertyTypeCard';
import { PropertyTypeFormDialog } from '@/features/admin/components/property-types/PropertyTypeFormDialog';
import { PropertyTypeTable } from '@/features/admin/components/property-types/PropertyTypeTable';
import {
  activatePropertyType,
  deactivatePropertyType,
  deletePropertyType,
} from '@/features/admin/services/admin-catalog-client';
import { AdminPropertyType, PropertyTypeStatus } from '@/features/admin/types/catalog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminPropertyTypesPanelProps {
  initial: AdminPropertyType[];
  initialStatus?: PropertyTypeStatus;
  initialSearch?: string;
}

export function AdminPropertyTypesPanel({
  initial,
  initialStatus,
  initialSearch = '',
}: AdminPropertyTypesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial);
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminPropertyType | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminPropertyType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }

  const applyFilters = useCallback(
    (status: string, search: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
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
    applyFilters(statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const runAction = async (id: string, action: () => Promise<void>, successMessage: string) => {
    setActionId(id);
    try {
      await action();
      refreshList();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
      setConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: AdminPropertyType) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const openDelete = (item: AdminPropertyType) => {
    setDeleteItem(item);
    setConfirmOpen(true);
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.propertyTypes', icon: Home },
        ]}
        title={t('admin.propertyTypes')}
        countLabel={t('admin.catalogCount').replace('{count}', String(items.length))}
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.searchCatalog')}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none focus:border-brand/40 focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
              >
                <option value="">{t('admin.allStatuses')}</option>
                <option value="active">{t('admin.status.active')}</option>
                <option value="inactive">{t('admin.status.inactive')}</option>
              </select>
              <Button onClick={openCreate} className="rounded-xl">
                <Plus size={16} />
                {t('admin.addPropertyType')}
              </Button>
            </div>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noPropertyTypes')}</p>
        </div>
      ) : (
        <>
          <PropertyTypeTable
            items={items}
            actionId={actionId}
            onEdit={openEdit}
            onActivate={(id) => void runAction(id, () => activatePropertyType(id), t('admin.propertyTypeActivated'))}
            onDeactivate={(id) => void runAction(id, () => deactivatePropertyType(id), t('admin.propertyTypeDeactivated'))}
            onDelete={openDelete}
          />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <PropertyTypeCard
                key={item.id}
                item={item}
                actionId={actionId}
                onEdit={openEdit}
                onActivate={(id) => void runAction(id, () => activatePropertyType(id), t('admin.propertyTypeActivated'))}
                onDeactivate={(id) => void runAction(id, () => deactivatePropertyType(id), t('admin.propertyTypeDeactivated'))}
                onDelete={openDelete}
              />
            ))}
          </div>
        </>
      )}

      <PropertyTypeFormDialog
        open={formOpen}
        item={editItem}
        onClose={() => setFormOpen(false)}
        onSaved={refreshList}
      />

      {deleteItem ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmDeleteCatalog').replace('{name}', deleteItem.name)}
          description={t('admin.confirmDeleteCatalogHint').replace('{name}', deleteItem.name)}
          confirmText={t('admin.delete')}
          cancelText={t('admin.cancel')}
          loading={actionId === deleteItem.id}
          danger
          onCancel={() => {
            setConfirmOpen(false);
            setDeleteItem(null);
          }}
          onConfirm={() => void runAction(deleteItem.id, () => deletePropertyType(deleteItem.id), t('admin.propertyTypeDeleted'))}
        />
      ) : null}
    </div>
  );
}
