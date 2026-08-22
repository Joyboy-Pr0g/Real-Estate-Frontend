'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftRight, Plus, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { TransactionTypeCard } from '@/features/admin/components/transaction-types/TransactionTypeCard';
import { TransactionTypeFormDialog } from '@/features/admin/components/transaction-types/TransactionTypeFormDialog';
import { TransactionTypeTable } from '@/features/admin/components/transaction-types/TransactionTypeTable';
import { deleteTransactionType } from '@/features/admin/services/admin-catalog-client';
import { AdminTransactionType } from '@/features/admin/types/catalog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

interface AdminTransactionTypesPanelProps {
  initial: AdminTransactionType[];
  initialSearch?: string;
}

export function AdminTransactionTypesPanel({ initial, initialSearch = '' }: AdminTransactionTypesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminTransactionType | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminTransactionType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }

  const applyFilters = useCallback(
    (search: string) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      router.refresh();
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

  const runDelete = async (item: AdminTransactionType) => {
    setActionId(item.id);
    try {
      await deleteTransactionType(item.id);
      refreshList();
      toast.success(t('admin.transactionTypeDeleted'));
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
          { labelKey: 'admin.transactionTypes', icon: ArrowLeftRight },
        ]}
        title={t('admin.transactionTypes')}
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
            <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="rounded-xl">
              <Plus size={16} />
              {t('admin.addTransactionType')}
            </Button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noTransactionTypes')}</p>
        </div>
      ) : (
        <>
          <TransactionTypeTable
            items={items}
            actionId={actionId}
            onEdit={(item) => { setEditItem(item); setFormOpen(true); }}
            onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
          />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <TransactionTypeCard
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

      <TransactionTypeFormDialog
        open={formOpen}
        item={editItem}
        onClose={() => setFormOpen(false)}
        onSaved={refreshList}
      />

      {deleteItem ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmDeleteCatalog').replace('{name}', deleteItem.display_name_ar)}
          description={t('admin.confirmDeleteCatalogHint').replace('{name}', deleteItem.display_name_ar)}
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
