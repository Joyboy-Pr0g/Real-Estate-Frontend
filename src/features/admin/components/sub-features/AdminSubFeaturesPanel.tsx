'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ListTree, Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { SubFeatureCard } from '@/features/admin/components/sub-features/SubFeatureCard';
import { SubFeatureFormDialog } from '@/features/admin/components/sub-features/SubFeatureFormDialog';
import { SubFeatureTable } from '@/features/admin/components/sub-features/SubFeatureTable';
import { deleteSubFeature } from '@/features/admin/services/admin-features-client';
import { AdminMainFeature, AdminSubFeature } from '@/features/admin/types/features';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminSubFeaturesPanelProps {
  initial: AdminSubFeature[];
  mainFeatures: AdminMainFeature[];
  initialMainFeatureId?: string;
}

export function AdminSubFeaturesPanel({
  initial,
  mainFeatures,
  initialMainFeatureId = '',
}: AdminSubFeaturesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial);
  const [searchInput, setSearchInput] = useState('');
  const [mainFeatureFilter, setMainFeatureFilter] = useState(initialMainFeatureId);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminSubFeature | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminSubFeature | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }

  const applyFilters = useCallback(
    (mainFeatureId: string) => {
      const params = new URLSearchParams();
      if (mainFeatureId) params.set('main_feature_id', mainFeatureId);
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
    applyFilters(mainFeatureFilter);
  }, [mainFeatureFilter, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const mainFeatureName = (id: string) => mainFeatures.find((f) => f.id === id)?.name ?? '—';

  const filteredItems = items.filter((item) => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.icon.toLowerCase().includes(q)
    );
  });

  const runDelete = async (item: AdminSubFeature) => {
    setActionId(item.id);
    try {
      await deleteSubFeature(item.id);
      refreshList();
      toast.success(t('admin.subFeatureDeleted'));
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
          { labelKey: 'admin.subFeatures', icon: ListTree },
        ]}
        title={t('admin.subFeatures')}
        countLabel={t('admin.catalogCount').replace('{count}', String(filteredItems.length))}
        filters={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                value={mainFeatureFilter}
                onChange={(e) => setMainFeatureFilter(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
              >
                <option value="">{t('admin.allMainFeatures')}</option>
                {mainFeatures.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/admin/features">{t('admin.mainFeatures')}</Link>
                </Button>
                <Button
                  onClick={() => { setEditItem(null); setFormOpen(true); }}
                  disabled={mainFeatures.length === 0}
                  className="rounded-xl"
                >
                  <Plus size={16} />
                  {t('admin.addSubFeature')}
                </Button>
              </div>
            </div>
          </div>
        }
      />

      {mainFeatures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">{t('admin.createMainFeatureFirst')}</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/admin/features">{t('admin.addMainFeature')}</Link>
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noSubFeatures')}</p>
        </div>
      ) : (
        <>
          <SubFeatureTable
            items={filteredItems}
            actionId={actionId}
            mainFeatureName={mainFeatureName}
            onEdit={(item) => { setEditItem(item); setFormOpen(true); }}
            onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
          />
          <div className="space-y-3 lg:hidden">
            {filteredItems.map((item) => (
              <SubFeatureCard
                key={item.id}
                item={item}
                mainFeatureName={mainFeatureName(item.main_feature_id)}
                actionId={actionId}
                onEdit={(i) => { setEditItem(i); setFormOpen(true); }}
                onDelete={(i) => { setDeleteItem(i); setConfirmOpen(true); }}
              />
            ))}
          </div>
        </>
      )}

      <SubFeatureFormDialog
        open={formOpen}
        item={editItem}
        mainFeatures={mainFeatures}
        defaultMainFeatureId={mainFeatureFilter}
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
