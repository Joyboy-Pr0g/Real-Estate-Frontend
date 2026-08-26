'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ExternalLink, Play, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toaster';
import { draftListing, softDeleteListing, restoreListing, hardDeleteListing } from '@/features/listings/services/listing-client';
import { ListingActionLogsPanel } from '@/features/listings/components/dashboard/ListingActionLogsPanel';
import { PublicListingDetail } from '@/features/listings/types/listing-detail';
import { AdminActionLogEntry, CursorPage, OfficeActionLogEntry } from '@/features/admin/types/action-logs';
import {
  formatSpecDisplayValue,
  getOrderedSpecEntries,
  getSpecFieldLabel,
} from '@/features/listings/lib/property-spec-display';
import { formatDateTime } from '@/lib/utils/format';
import { formatPriceYER } from '@/lib/utils/currency';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  published: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  sold: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  rented: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

interface AdminListingDetailViewProps {
  listing: PublicListingDetail;
  initialAdminLogs?: CursorPage<AdminActionLogEntry>;
  initialOfficeLogs?: CursorPage<OfficeActionLogEntry>;
}

export function AdminListingDetailView({
  listing,
  initialAdminLogs,
  initialOfficeLogs,
}: AdminListingDetailViewProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'soft_delete' | 'hard_delete' | null>(null);
  const deletedAt = listing.deleted_at;
  const specSchema = listing.property_subtype.spec_schema;
  const specEntries = getOrderedSpecEntries(listing.property_specs, specSchema);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setSubmitting(true);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-dark">{listing.title}</h1>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[listing.status])}>
              {t(`dashboard.listings.status.${listing.status}` as TranslationKey)}
            </span>
            {deletedAt ? (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                {t('admin.status.soft_deleted')}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {listing.neighborhood.name}, {listing.city.name} · #{listing.custom_id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!deletedAt && listing.status === 'published' ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => void runAction(() => draftListing(listing.id), t('dashboard.listings.drafted'))}
            >
              {t('dashboard.listings.actionDraft')}
            </Button>
          ) : null}

          {!deletedAt ? (
            <Button type="button" variant="dangerOutline" disabled={submitting} onClick={() => setConfirmAction('soft_delete')}>
              {t('admin.softDelete')}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void runAction(() => restoreListing(listing.id), t('admin.listingRestored'))}
              >
                {t('admin.restore')}
              </Button>
              <Button type="button" variant="danger" disabled={submitting} onClick={() => setConfirmAction('hard_delete')}>
                {t('admin.hardDelete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {listing.photos.length > 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
              <h2 className="mb-3 text-sm font-bold text-primary-dark">{t('dashboard.listings.images')}</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {listing.photos.map((photo) => (
                  <div key={photo.url} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <Image src={photo.url} alt="" fill className="object-cover" sizes="200px" />
                    {photo.is_main ? (
                      <span className="absolute start-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                        {t('dashboard.listings.mainPhoto')}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {listing.video_url ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-dark">
                <Play className="h-4 w-4" />
                {t('dashboard.listings.video')}
              </h2>
              <video
                src={listing.video_url}
                controls
                className="max-h-80 w-full rounded-xl bg-black"
                poster={listing.video_thumbnail ?? undefined}
              />
            </section>
          ) : null}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.listings.description')}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{listing.description}</p>
          </section>

          {specEntries.length > 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.listings.specsTitle')}</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {specEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium text-gray-400">{getSpecFieldLabel(key, specSchema)}</dt>
                    <dd className="text-sm font-medium text-primary-dark">
                      {formatSpecDisplayValue(key, value, specSchema, {
                        yes: t('detail.specs.yes'),
                        no: t('detail.specs.no'),
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {listing.histories.length > 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="text-sm font-bold text-primary-dark">{t('admin.listingHistory')}</h2>
              <div className="mt-4 space-y-2">
                {listing.histories.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm">
                    <span className="font-medium text-primary-dark">
                      {t(`dashboard.listings.status.${entry.action}` as TranslationKey)}
                    </span>
                    <span className="text-brand-dark">{formatPriceYER(entry.price)}</span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(entry.started_at)}
                      {entry.ended_at ? ` – ${formatDateTime(entry.ended_at)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <ListingActionLogsPanel
            listingId={listing.id}
            mode="admin"
            initialAdminLogs={initialAdminLogs}
            initialOfficeLogs={initialOfficeLogs}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-bold text-primary-dark">{t('admin.seller')}</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                {listing.seller.type === 'office' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary-dark">{listing.seller.name}</p>
                <p className="truncate text-xs text-gray-500">{listing.seller.phone_number}</p>
                {listing.seller.type === 'office' ? (
                  <Link
                    href={`/admin/offices/${listing.seller.id}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                  >
                    {t('admin.viewOffice')}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.listings.price')}</dt>
                <dd className="font-semibold text-brand-dark">{formatPriceYER(listing.price)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.listings.propertyType')}</dt>
                <dd className="text-primary-dark">{listing.property_type.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.listings.propertySubtype')}</dt>
                <dd className="text-primary-dark">{listing.property_subtype.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.listings.transactionType')}</dt>
                <dd className="text-primary-dark">{listing.transaction_type.display_name_ar || listing.transaction_type.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('dashboard.address')}</dt>
                <dd className="text-end text-primary-dark">{listing.address}</dd>
              </div>
              {listing.published_at ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">{t('dashboard.listings.publishedAt')}</dt>
                  <dd className="text-primary-dark">{formatDateTime(listing.published_at)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">{t('admin.userJoined')}</dt>
                <dd className="text-primary-dark">{formatDateTime(listing.created_at)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmAction !== null}
        title={t('admin.confirmTitle').replace('{name}', listing.title)}
        description={
          confirmAction === 'hard_delete'
            ? t('admin.confirmHardDelete').replace('{name}', listing.title)
            : t('admin.confirmSoftDelete').replace('{name}', listing.title)
        }
        confirmText={confirmAction === 'hard_delete' ? t('admin.hardDelete') : t('admin.softDelete')}
        cancelText={t('admin.cancel')}
        loading={submitting}
        danger
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction === 'hard_delete') {
            void runAction(() => hardDeleteListing(listing.id), t('dashboard.listings.softDeleted'));
          } else {
            void runAction(() => softDeleteListing(listing.id), t('dashboard.listings.softDeleted'));
          }
        }}
      />
    </div>
  );
}
