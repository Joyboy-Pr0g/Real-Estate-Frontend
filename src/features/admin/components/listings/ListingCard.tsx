'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { ListingActionsMenu } from '@/features/admin/components/listings/ListingActionsMenu';
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

interface ListingCardProps {
  listing: AdminListingSummary;
  actionId: string | null;
  onDraft: (listing: AdminListingSummary) => void;
  onSoftDelete: (listing: AdminListingSummary) => void;
  onRestore: (listing: AdminListingSummary) => void;
  onHardDelete: (listing: AdminListingSummary) => void;
}

export function ListingCard({ listing, actionId, onDraft, onSoftDelete, onRestore, onHardDelete }: ListingCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <Link href={`/admin/listings/${listing.id}`} className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {listing.main_photo ? (
            <Image src={listing.main_photo} alt={listing.title} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-5 w-5" />
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/admin/listings/${listing.id}`} className="truncate text-sm font-bold text-primary-dark hover:underline">
            {listing.title}
          </Link>
          <p className="text-xs text-gray-500">{listing.seller_name ?? '—'}</p>
          <p className="mt-0.5 text-sm font-semibold text-brand-dark">{formatPriceYER(listing.price)}</p>
        </div>
        <ListingActionsMenu
          listing={listing}
          disabled={actionId === listing.id}
          onDraft={() => onDraft(listing)}
          onSoftDelete={() => onSoftDelete(listing)}
          onRestore={() => onRestore(listing)}
          onHardDelete={() => onHardDelete(listing)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[listing.status])}>
          {t(`dashboard.listings.status.${listing.status}` as TranslationKey)}
        </span>
        {listing.deleted_at ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
            {t('admin.status.soft_deleted')}
          </span>
        ) : null}
        <span className="text-xs text-gray-400">{formatDateTime(listing.created_at)}</span>
      </div>
    </article>
  );
}
