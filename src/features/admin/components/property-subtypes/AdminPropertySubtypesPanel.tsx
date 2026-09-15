'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layers, Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { PropertySubtypeCard } from '@/features/admin/components/property-subtypes/PropertySubtypeCard';
import { PropertySubtypeFormDialog } from '@/features/admin/components/property-subtypes/PropertySubtypeFormDialog';
import { PropertySubtypeTable } from '@/features/admin/components/property-subtypes/PropertySubtypeTable';
import { deletePropertySubtype } from '@/features/admin/services/admin-catalog-client';
import { AdminPropertySubtype, AdminPropertyType } from '@/features/admin/types/catalog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminPropertySubtypesPanelProps {
  initial: AdminPropertySubtype[];
  propertyTypes: AdminPropertyType[];
  initialSearch?: string;
  initialPropertyTypeId?: string;
}

export function AdminPropertySubtypesPanel({
  initial,
  propertyTypes,
  initialSearch = '',
  initialPropertyTypeId = '',
}: AdminPropertySubtypesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(initialPropertyTypeId);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminPropertySubtype | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminPropertySubtype | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }

  const applyFilters = useCallback(
    (search: string, propertyTypeId: string) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (propertyTypeId) params.set('property_type_id', propertyTypeId);
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
    applyFilters(debouncedSearch, propertyTypeFilter);
  }, [debouncedSearch, propertyTypeFilter, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const typeName = (id: string) => propertyTypes.find((pt) => pt.id === id)?.name ?? '—';

  const runDelete = async (item: AdminPropertySubtype) => {
    setActionId(item.id);
    try {
      await deletePropertySubtype(item.id);
      refreshList();
      toast.success(t('admin.propertySubtypeDeleted'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
      setConfirmOpen(false);
      setDeleteItem(null);
    }
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.propertySubtypes', icon: Layers },
        ]}
        title={t('admin.propertySubtypes')}
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
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
              >
                <option value="">{t('admin.allPropertyTypes')}</option>
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
              {hasPermission('property_subtypes.create') ? (
                <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="rounded-xl">
                  <Plus size={16} />
                  {t('admin.addPropertySubtype')}
                </Button>
              ) : null}
            </div>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noPropertySubtypes')}</p>
        </div>
      ) : (
        <>
          <PropertySubtypeTable
            items={items}
            propertyTypes={propertyTypes}
            actionId={actionId}
            onEdit={(item) => { setEditItem(item); setFormOpen(true); }}
            onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
          />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <PropertySubtypeCard
                key={item.id}
                item={item}
                propertyTypeName={typeName(item.property_type_id)}
                actionId={actionId}
                onEdit={(i) => { setEditItem(i); setFormOpen(true); }}
                onDelete={(i) => { setDeleteItem(i); setConfirmOpen(true); }}
              />
            ))}
          </div>
        </>
      )}

      <PropertySubtypeFormDialog
        open={formOpen}
        item={editItem}
        propertyTypes={propertyTypes}
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
          onCancel={() => { setConfirmOpen(false); setDeleteItem(null); }}
          onConfirm={() => void runDelete(deleteItem)}
        />
      ) : null}
    </div>
  );
}
