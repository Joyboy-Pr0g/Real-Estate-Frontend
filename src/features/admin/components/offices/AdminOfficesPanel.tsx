'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Building2, Loader2, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';
import { RejectReasonModal } from '@/features/admin/components/RejectReasonModal';
import { OfficeTable } from '@/features/admin/components/offices/OfficeTable';
import { OfficeCard } from '@/features/admin/components/offices/OfficeCard';
import {
  verifyOffice,
  rejectOffice,
  suspendOffice,
  unsuspendOffice,
  adminSoftDeleteOffice,
  restoreOffice,
  hardDeleteOffice,
  loadMoreAdminOffices,
} from '@/features/office/services/admin-offices-client';
import { AdminOfficesPage, OfficeDetail, OfficeVerificationStatus } from '@/features/office/types/office';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

const STATUSES: OfficeVerificationStatus[] = ['pending', 'verified', 'rejected', 'suspended'];
const PAGE_SIZE = 20;

interface AdminOfficesPanelProps {
  initial: AdminOfficesPage;
  initialVerificationStatus?: OfficeVerificationStatus;
  initialSearch?: string;
  initialIncludeDeleted?: boolean;
  lockedStatus?: OfficeVerificationStatus;
}

type ConfirmAction = 'soft_delete' | 'hard_delete';

export function AdminOfficesPanel({
  initial,
  initialVerificationStatus,
  initialSearch = '',
  initialIncludeDeleted = false,
  lockedStatus,
}: AdminOfficesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [offices, setOffices] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [statusFilter, setStatusFilter] = useState(initialVerificationStatus ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmOffice, setConfirmOffice] = useState<OfficeDetail | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('soft_delete');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOfficeTarget, setRejectOfficeTarget] = useState<OfficeDetail | null>(null);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setOffices(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }

  const applyFilters = useCallback(
    (status: string, search: string, deleted: boolean) => {
      const params = new URLSearchParams();
      if (!lockedStatus && status) params.set('verificationStatus', status);
      if (search.trim()) params.set('search', search.trim());
      if (deleted) params.set('include_deleted', 'true');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, lockedStatus],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(statusFilter, debouncedSearch, includeDeleted);
  }, [statusFilter, debouncedSearch, includeDeleted, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const runAction = async (id: string, action: () => Promise<void>, successMessage?: string) => {
    setActionId(id);
    try {
      await action();
      refreshList();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
      setConfirmOpen(false);
      setConfirmOffice(null);
    }
  };

  const openConfirm = (office: OfficeDetail, action: ConfirmAction) => {
    setConfirmOffice(office);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmOffice) return;
    if (confirmAction === 'hard_delete') {
      void runAction(confirmOffice.id, () => hardDeleteOffice(confirmOffice.id), t('admin.officeDeleted'));
      return;
    }
    void runAction(confirmOffice.id, () => adminSoftDeleteOffice(confirmOffice.id), t('admin.officeSoftDeleted'));
  };

  const handleReject = (reason: string) => {
    if (!rejectOfficeTarget) return;
    void runAction(rejectOfficeTarget.id, () => rejectOffice(rejectOfficeTarget.id, reason), t('admin.officeRejected')).then(
      () => setRejectOfficeTarget(null),
    );
  };

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = { cursor: nextCursor, limit: String(PAGE_SIZE) };
      const status = lockedStatus ?? statusFilter;
      if (status) params.verificationStatus = status;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (includeDeleted) params.include_deleted = 'true';

      const page = await loadMoreAdminOffices(params);
      setOffices((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const actionProps = {
    actionId,
    onVerify: (office: OfficeDetail) => void runAction(office.id, () => verifyOffice(office.id), t('admin.officeVerified')),
    onReject: (office: OfficeDetail) => setRejectOfficeTarget(office),
    onSuspend: (office: OfficeDetail) => void runAction(office.id, () => suspendOffice(office.id), t('admin.officeSuspended')),
    onUnsuspend: (office: OfficeDetail) =>
      void runAction(office.id, () => unsuspendOffice(office.id), t('admin.officeUnsuspended')),
    onSoftDelete: (office: OfficeDetail) => openConfirm(office, 'soft_delete'),
    onRestore: (office: OfficeDetail) => void runAction(office.id, () => restoreOffice(office.id), t('admin.officeRestored')),
    onHardDelete: (office: OfficeDetail) => openConfirm(office, 'hard_delete'),
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: lockedStatus ? 'admin.pendingOffices' : 'admin.offices', icon: Building2 },
        ]}
        title={t(lockedStatus ? 'admin.pendingOffices' : 'admin.offices')}
        countLabel={t('admin.usersCount').replace('{count}', String(offices.length))}
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.searchUsers')}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!lockedStatus ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40"
                >
                  <option value="">{t('admin.allStatuses')}</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`dashboard.verification.${status}` as const)}
                    </option>
                  ))}
                </select>
              ) : null}

              <TogglePill
                checked={includeDeleted}
                onCheckedChange={setIncludeDeleted}
                label={t('admin.includeDeleted')}
                icon={<Archive size={15} />}
              />
            </div>
          </div>
        }
      />

      {offices.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noOffices')}</p>
        </div>
      ) : (
        <>
          <OfficeTable offices={offices} {...actionProps} />
          <div className="space-y-3 lg:hidden">
            {offices.map((office) => (
              <OfficeCard key={office.id} office={office} {...actionProps} />
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

      {confirmOffice ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmTitle').replace('{name}', confirmOffice.name)}
          description={
            confirmAction === 'hard_delete'
              ? t('admin.confirmHardDelete').replace('{name}', confirmOffice.name)
              : t('admin.confirmSoftDelete').replace('{name}', confirmOffice.name)
          }
          confirmText={confirmAction === 'hard_delete' ? t('admin.hardDelete') : t('admin.softDelete')}
          cancelText={t('admin.cancel')}
          loading={actionId === confirmOffice.id}
          danger
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmOffice(null);
          }}
          onConfirm={handleConfirm}
        />
      ) : null}

      <RejectReasonModal
        open={rejectOfficeTarget !== null}
        title={t('admin.confirmTitle').replace('{name}', rejectOfficeTarget?.name ?? '')}
        loading={rejectOfficeTarget ? actionId === rejectOfficeTarget.id : false}
        onConfirm={handleReject}
        onCancel={() => setRejectOfficeTarget(null)}
      />
    </div>
  );
}
