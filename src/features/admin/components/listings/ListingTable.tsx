'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { ListingActionsMenu } from '@/features/admin/components/listings/ListingActionsMenu';
import { AdminAuditTrigger } from '@/features/admin/components/audit/AdminAuditTrigger';
import { AdminLatestAction } from '@/features/admin/types/action-logs';
import { AdminListingSummary } from '@/features/listings/types/listing';
import { formatDateTime } from '@/lib/utils/format';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<AdminListingSummary['status'], string> = {
  draft: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  published: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  sold: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  rented: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

interface ListingRowActions {
  actionId: string | null;
  onDraft: (listing: AdminListingSummary) => void;
  onSoftDelete: (listing: AdminListingSummary) => void;
  onRestore: (listing: AdminListingSummary) => void;
  onHardDelete: (listing: AdminListingSummary) => void;
}

interface ListingTableProps extends ListingRowActions {
  listings: AdminListingSummary[];
  latestActions?: Record<string, AdminLatestAction>;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (listingId: string) => void;
  onToggleSelectAll?: () => void;
}

export function ListingTable({
  listings,
  latestActions = {},
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  actionId,
  onDraft,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: ListingTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              {selectable ? (
                <th className="w-10 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={listings.length > 0 && selectedIds!.size === listings.length}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label={t('admin.selectAll')}
                  />
                </th>
              ) : null}
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.listings.title')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.seller')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.listings.price')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userJoined')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.audit')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                {selectable ? (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds!.has(listing.id)}
                      onChange={() => onToggleSelect!(listing.id)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label={listing.title}
                    />
                  </td>
                ) : null}
                <td className="px-5 py-4">
                  <Link href={`/admin/listings/${listing.id}`} className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {listing.main_photo ? (
                        <Image src={listing.main_photo} alt={listing.title} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-64 truncate font-semibold text-primary-dark hover:underline">{listing.title}</p>
                      <p className="text-xs text-gray-400">
                        {listing.neighborhood_name}, {listing.city_name}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 text-gray-600">{listing.seller_name ?? '—'}</td>
                <td className="px-5 py-4 font-semibold text-brand-dark">{formatPriceYER(listing.price)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[listing.status])}>
                      {t(`dashboard.listings.status.${listing.status}` as TranslationKey)}
                    </span>
                    {listing.deleted_at ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        {t('admin.status.soft_deleted')}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(listing.created_at)}</td>
                <td className="px-5 py-4">
                  <AdminAuditTrigger action={latestActions[listing.id]} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <ListingActionsMenu
                      listing={listing}
                      disabled={actionId === listing.id}
                      onDraft={() => onDraft(listing)}
                      onSoftDelete={() => onSoftDelete(listing)}
                      onRestore={() => onRestore(listing)}
                      onHardDelete={() => onHardDelete(listing)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
