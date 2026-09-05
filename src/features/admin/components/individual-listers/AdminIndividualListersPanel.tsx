'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Loader2, Search, Sparkles } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';
import { RejectReasonModal } from '@/features/admin/components/RejectReasonModal';
import { IndividualListerTable } from '@/features/admin/components/individual-listers/IndividualListerTable';
import { IndividualListerCard } from '@/features/admin/components/individual-listers/IndividualListerCard';
import {
  verifyIndividualLister,
  rejectIndividualLister,
  suspendIndividualLister,
  unsuspendIndividualLister,
  softDeleteIndividualLister,
  restoreIndividualLister,
  hardDeleteIndividualLister,
  loadMoreAdminIndividualListers,
} from '@/features/individual-lister/services/admin-individual-listers-client';
import {
  AdminIndividualListersPage,
  IndividualListerProfile,
  IndividualListerVerificationStatus,
} from '@/features/individual-lister/types/individual-lister';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';

const STATUSES: IndividualListerVerificationStatus[] = ['pending', 'verified', 'rejected', 'suspended'];
const PAGE_SIZE = 20;

interface AdminIndividualListersPanelProps {
  initial: AdminIndividualListersPage;
  initialVerificationStatus?: IndividualListerVerificationStatus;
  initialSearch?: string;
  initialIncludeDeleted?: boolean;
  lockedStatus?: IndividualListerVerificationStatus;
}

type ConfirmAction = 'soft_delete' | 'hard_delete' | 'verify';

export function AdminIndividualListersPanel({
  initial,
  initialVerificationStatus,
  initialSearch = '',
  initialIncludeDeleted = false,
  lockedStatus,
}: AdminIndividualListersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [listers, setListers] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [statusFilter, setStatusFilter] = useState(initialVerificationStatus ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmLister, setConfirmLister] = useState<IndividualListerProfile | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('soft_delete');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<IndividualListerProfile | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<IndividualListerProfile | null>(null);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setListers(initial.items);
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
      setConfirmLister(null);
    }
  };

  const openConfirm = (lister: IndividualListerProfile, action: ConfirmAction) => {
    setConfirmLister(lister);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const listerName = (lister: IndividualListerProfile) =>
    lister.user ? `${lister.user.f_name} ${lister.user.l_name}` : lister.id;

  const handleConfirm = () => {
    if (!confirmLister) return;
    if (confirmAction === 'verify') {
      void runAction(confirmLister.id, () => verifyIndividualLister(confirmLister.id), t('admin.listerVerified'));
      return;
    }
    if (confirmAction === 'hard_delete') {
      void runAction(confirmLister.id, () => hardDeleteIndividualLister(confirmLister.id), t('admin.listerDeleted'));
      return;
    }
    void runAction(confirmLister.id, () => softDeleteIndividualLister(confirmLister.id), t('admin.listerSoftDeleted'));
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    void runAction(rejectTarget.id, () => rejectIndividualLister(rejectTarget.id, reason), t('admin.listerRejected')).then(
      () => setRejectTarget(null),
    );
  };

  const handleSuspend = (reason: string) => {
    if (!suspendTarget) return;
    void runAction(suspendTarget.id, () => suspendIndividualLister(suspendTarget.id, reason), t('admin.listerSuspended')).then(
      () => setSuspendTarget(null),
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

      const page = await loadMoreAdminIndividualListers(params);
      setListers((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const actionProps = {
    actionId,
    onVerify: (lister: IndividualListerProfile) => openConfirm(lister, 'verify'),
    onReject: (lister: IndividualListerProfile) => setRejectTarget(lister),
    onSuspend: (lister: IndividualListerProfile) => setSuspendTarget(lister),
    onUnsuspend: (lister: IndividualListerProfile) =>
      void runAction(lister.id, () => unsuspendIndividualLister(lister.id), t('admin.listerUnsuspended')),
    onSoftDelete: (lister: IndividualListerProfile) => openConfirm(lister, 'soft_delete'),
    onRestore: (lister: IndividualListerProfile) =>
      void runAction(lister.id, () => restoreIndividualLister(lister.id), t('admin.listerRestored')),
    onHardDelete: (lister: IndividualListerProfile) => openConfirm(lister, 'hard_delete'),
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: lockedStatus ? 'admin.pendingIndividualListers' : 'admin.individualListers', icon: Sparkles },
        ]}
        title={t(lockedStatus ? 'admin.pendingIndividualListers' : 'admin.individualListers')}
        countLabel={t('admin.usersCount').replace('{count}', String(listers.length))}
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

      {listers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('admin.noIndividualListers')}</p>
        </div>
      ) : (
        <>
          <IndividualListerTable listers={listers} {...actionProps} />
          <div className="space-y-3 lg:hidden">
            {listers.map((lister) => (
              <IndividualListerCard key={lister.id} lister={lister} {...actionProps} />
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

      {confirmLister ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmTitle').replace('{name}', listerName(confirmLister))}
          description={
            confirmAction === 'hard_delete'
              ? t('admin.confirmHardDelete').replace('{name}', listerName(confirmLister))
              : confirmAction === 'soft_delete'
                ? t('admin.confirmSoftDelete').replace('{name}', listerName(confirmLister))
                : t('admin.confirmVerifyLister').replace('{name}', listerName(confirmLister))
          }
          confirmText={
            confirmAction === 'hard_delete'
              ? t('admin.hardDelete')
              : confirmAction === 'soft_delete'
                ? t('admin.softDelete')
                : t('admin.verify')
          }
          cancelText={t('admin.cancel')}
          loading={actionId === confirmLister.id}
          danger={confirmAction !== 'verify'}
          showCannotUndo={confirmAction !== 'verify'}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmLister(null);
          }}
          onConfirm={handleConfirm}
        />
      ) : null}

      <RejectReasonModal
        open={rejectTarget !== null}
        title={t('admin.confirmTitle').replace('{name}', rejectTarget ? listerName(rejectTarget) : '')}
        loading={rejectTarget ? actionId === rejectTarget.id : false}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />

      <RejectReasonModal
        open={suspendTarget !== null}
        title={t('admin.confirmTitle').replace('{name}', suspendTarget ? listerName(suspendTarget) : '')}
        loading={suspendTarget ? actionId === suspendTarget.id : false}
        confirmLabel={t('admin.suspend')}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
}
