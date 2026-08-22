'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { MainFeatureCard } from '@/features/admin/components/features/MainFeatureCard';
import { MainFeatureFormDialog } from '@/features/admin/components/features/MainFeatureFormDialog';
import { MainFeatureTable } from '@/features/admin/components/features/MainFeatureTable';
import { deleteMainFeature } from '@/features/admin/services/admin-features-client';
import { AdminMainFeature } from '@/features/admin/types/features';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminMainFeaturesPanelProps {
  initial: AdminMainFeature[];
}

export function AdminMainFeaturesPanel({ initial }: AdminMainFeaturesPanelProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminMainFeature | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminMainFeature | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.icon.toLowerCase().includes(q),
    );
  }, [initial, searchInput]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const runDelete = async (item: AdminMainFeature) => {
    if ((item.sub_features?.length ?? 0) > 0) {
      toast.error(t('admin.mainFeatureHasSubFeatures'));
      return;
    }

    setActionId(item.id);
    try {
      await deleteMainFeature(item.id);
      refreshList();
      toast.success(t('admin.mainFeatureDeleted'));
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
          { labelKey: 'admin.mainFeatures', icon: Sparkles },
        ]}
        title={t('admin.mainFeatures')}
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
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/admin/sub-features">{t('admin.subFeatures')}</Link>
              </Button>
              <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="rounded-xl">
                <Plus size={16} />
                {t('admin.addMainFeature')}
              </Button>
            </div>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noMainFeatures')}</p>
        </div>
      ) : (
        <>
          <MainFeatureTable
            items={items}
            actionId={actionId}
            onEdit={(item) => { setEditItem(item); setFormOpen(true); }}
            onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
          />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <MainFeatureCard
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

      <MainFeatureFormDialog
        open={formOpen}
        item={editItem}
        onClose={() => setFormOpen(false)}
        onSaved={refreshList}
      />

      {deleteItem ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmDeleteCatalog').replace('{name}', deleteItem.name)}
          description={
            (deleteItem.sub_features?.length ?? 0) > 0
              ? t('admin.mainFeatureDeleteBlockedHint')
              : t('admin.confirmDeleteCatalogHint').replace('{name}', deleteItem.name)
          }
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
