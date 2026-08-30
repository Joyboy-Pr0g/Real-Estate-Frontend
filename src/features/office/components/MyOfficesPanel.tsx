'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Building2,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toaster';
import { OfficeApplicationForm } from '@/features/office/components/OfficeApplicationForm';
import {
  fetchMyDeletedOffices,
  hardDeleteOffice,
  restoreOffice,
  softDeleteOffice,
} from '@/features/office/services/office-client';
import { MyOffice } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

interface MyOfficesPanelProps {
  offices: MyOffice[];
  userId: string;
  cities: PublicCity[];
}

function isOfficeAdmin(office: MyOffice, userId: string): boolean {
  return office.office_users.some((member) => member.user_id === userId && member.role === 'office_admin');
}

interface OfficeCardProps {
  office: MyOffice;
  isAdmin: boolean;
  onDelete: () => void;
}

function OfficeCard({ office, isAdmin, onDelete }: OfficeCardProps) {
  const { t } = useLocale();
  const detailHref = `/dashboard/office/${office.id}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        {office.office_photo_url ? (
          <Image
            src={office.office_photo_url}
            alt={office.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Building2 className="h-10 w-10" />
          </div>
        )}

        <div className="absolute top-3 end-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white/95 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-primary-dark">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={detailHref}>
                  <Eye className="h-4 w-4" />
                  {t('admin.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {isAdmin ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-700"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('admin.softDelete')}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold text-primary-dark">{office.name}</h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
              STATUS_STYLES[office.verification_status],
            )}
          >
            {t(`dashboard.verification.${office.verification_status}` as TranslationKey)}
          </span>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600">{office.email}</dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600" dir="ltr">
              {office.phone_number}
            </dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <dd className="truncate text-gray-600">
              {office.city.name}, {office.neighborhood.name}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

const OFFICE_STATUSES = ['pending', 'verified', 'rejected', 'suspended'] as const;
const fieldClass = 'h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40';

interface DeletedOfficesModalProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

function DeletedOfficesModal({ open, onClose, onChanged }: DeletedOfficesModalProps) {
  const { t } = useLocale();
  const [items, setItems] = useState<MyOffice[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ office: MyOffice; action: 'restore' | 'hard_delete' } | null>(null);

  const load = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (!reset && cursor) params.cursor = cursor;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (statusFilter) params.verificationStatus = statusFilter;

        const page = await fetchMyDeletedOffices(params);
        setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
        setCursor(page.next_cursor);
        setHasMore(page.has_more);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [cursor, debouncedSearch, statusFilter],
  );

  useEffect(() => {
    if (!open) return;
    setItems([]);
    setCursor(null);
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch, statusFilter]);

  const runConfirm = async () => {
    if (!confirm) return;
    setActionId(confirm.office.id);
    try {
      if (confirm.action === 'restore') {
        await restoreOffice(confirm.office.id);
        toast.success(t('dashboard.office.restored'));
      } else {
        await hardDeleteOffice(confirm.office.id);
        toast.success(t('dashboard.office.hardDeleted'));
      }
      setConfirm(null);
      setItems([]);
      setCursor(null);
      onChanged();
      await load(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(90vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-float)]"
      >
        <div className="relative shrink-0 border-b border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('admin.close')}
            className="absolute start-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="ps-10 text-lg font-bold text-primary-dark">{t('dashboard.office.deletedOfficesTitle')}</h2>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 border-b border-gray-100 px-6 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.searchUsers')}
              className={cn(fieldClass, 'w-full ps-9')}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={fieldClass}>
            <option value="">{t('admin.allStatuses')}</option>
            {OFFICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`dashboard.verification.${status}` as TranslationKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 && !loading ? (
            <p className="py-8 text-center text-sm text-gray-500">{t('dashboard.office.deletedOfficesEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {items.map((office) => (
                <div
                  key={office.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary-dark">{office.name}</p>
                    <p className="text-xs text-gray-500">
                      {office.city.name}, {office.neighborhood.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={actionId === office.id}
                      onClick={() => setConfirm({ office, action: 'restore' })}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t('admin.restore')}
                    </Button>
                    <Button
                      type="button"
                      variant="dangerOutline"
                      size="sm"
                      disabled={actionId === office.id}
                      onClick={() => setConfirm({ office, action: 'hard_delete' })}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('admin.hardDelete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasMore ? (
          <div className="flex shrink-0 justify-center border-t border-gray-100 p-4">
            <Button type="button" variant="outline" disabled={loading} onClick={() => void load(false)}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('admin.loadMore')}
            </Button>
          </div>
        ) : null}

        {confirm ? (
          <ConfirmModal
            open
            title={t(
              confirm.action === 'restore'
                ? 'dashboard.office.confirmRestoreTitle'
                : 'dashboard.office.confirmHardDeleteTitle',
            )}
            description={t(
              confirm.action === 'restore'
                ? 'dashboard.office.confirmRestoreDescription'
                : 'dashboard.office.confirmHardDeleteDescription',
            )}
            confirmText={confirm.action === 'restore' ? t('admin.restore') : t('admin.hardDelete')}
            cancelText={t('admin.cancel')}
            danger={confirm.action === 'hard_delete'}
            loading={actionId === confirm.office.id}
            onConfirm={() => void runConfirm()}
            onCancel={() => setConfirm(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

export function MyOfficesPanel({ offices, userId, cities }: MyOfficesPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MyOffice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedModalOpen, setDeletedModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const canCreateOffice =
    offices.length === 0 || offices.some((office) => isOfficeAdmin(office, userId));

  const filteredOffices = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return offices.filter((office) => {
      if (statusFilter && office.verification_status !== statusFilter) return false;
      if (!query) return true;
      return (
        office.name.toLowerCase().includes(query) ||
        office.email.toLowerCase().includes(query) ||
        office.phone_number.includes(query) ||
        office.city.name.toLowerCase().includes(query) ||
        office.neighborhood.name.toLowerCase().includes(query)
      );
    });
  }, [offices, statusFilter, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await softDeleteOffice(deleteTarget.id);
      toast.success(t('dashboard.office.softDeleted'));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xl">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.searchUsers')}
              className={cn(fieldClass, 'w-full ps-9')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={fieldClass}>
              <option value="">{t('admin.allStatuses')}</option>
              {OFFICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`dashboard.verification.${status}` as TranslationKey)}
                </option>
              ))}
            </select>

            <Button type="button" variant="outline" onClick={() => setDeletedModalOpen(true)}>
              <Archive className="h-4 w-4" />
              {t('dashboard.office.deletedOffices')}
            </Button>

            {canCreateOffice ? (
              <Button type="button" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4" />
                {t('dashboard.office.createNew')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {showCreateForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="flex w-full max-w-2xl max-h-[min(90vh,800px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-float)]"
          >
            <div className="relative shrink-0 border-b border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                aria-label={t('admin.close')}
                className="absolute start-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="ps-10 text-lg font-bold text-primary-dark">{t('dashboard.office.createNew')}</h2>
            </div>
            <div className="overflow-y-auto px-6 py-4">
              <OfficeApplicationForm
                cities={cities}
                onCancel={() => setShowCreateForm(false)}
                onSuccess={() => {
                  setShowCreateForm(false);
                  router.refresh();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {filteredOffices.length === 0 ? (
        <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              isAdmin={isOfficeAdmin(office, userId)}
              onDelete={() => setDeleteTarget(office)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={t('dashboard.office.confirmDeleteTitle')}
        description={t('dashboard.office.confirmDeleteDescription')}
        confirmText={t('admin.softDelete')}
        cancelText={t('admin.cancel')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <DeletedOfficesModal
        open={deletedModalOpen}
        onClose={() => setDeletedModalOpen(false)}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
