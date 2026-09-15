'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Landmark, Loader2, Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { CityCard } from '@/features/admin/components/cities/CityCard';
import { CityFormDialog } from '@/features/admin/components/cities/CityFormDialog';
import { CityTable } from '@/features/admin/components/cities/CityTable';
import {
  deleteCity,
  loadMoreAdminCities,
} from '@/features/admin/services/admin-locations-client';
import { AdminCity, AdminLocationsPage } from '@/features/admin/types/locations';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminCitiesPanelProps {
  initial: AdminLocationsPage<AdminCity>;
  initialSearch?: string;
}

export function AdminCitiesPanel({ initial, initialSearch = '' }: AdminCitiesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminCity | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminCity | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }

  const applyFilters = useCallback(
    (search: string) => {
      const params = new URLSearchParams();
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
    applyFilters(debouncedSearch);
  }, [debouncedSearch, applyFilters]);

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

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await loadMoreAdminCities({
        cursor: nextCursor,
        search: debouncedSearch.trim() || undefined,
      });
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.cities', icon: Landmark },
        ]}
        title={t('admin.cities')}
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
            {hasPermission('cities.create') ? (
              <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="rounded-xl">
                <Plus size={16} />
                {t('admin.addCity')}
              </Button>
            ) : null}
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noCities')}</p>
        </div>
      ) : (
        <>
          <CityTable
            items={items}
            actionId={actionId}
            onEdit={(item) => { setEditItem(item); setFormOpen(true); }}
            onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
          />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <CityCard
                key={item.id}
                item={item}
                actionId={actionId}
                onEdit={(i) => { setEditItem(i); setFormOpen(true); }}
                onDelete={(i) => { setDeleteItem(i); setConfirmOpen(true); }}
              />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => void handleLoadMore()} disabled={loadingMore} className="rounded-xl">
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}

      <CityFormDialog
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
          onCancel={() => { setConfirmOpen(false); setDeleteItem(null); }}
          onConfirm={() => void runAction(deleteItem.id, () => deleteCity(deleteItem.id), t('admin.cityDeleted'))}
        />
      ) : null}
    </div>
  );
}
