import Image from 'next/image';
import { BadgeCheck, Building2, Mail, Phone, User } from 'lucide-react';
import { PublicListingSeller } from '@/features/listings/types/listing-detail';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingOfficeCardProps {
  seller: PublicListingSeller;
}

export async function ListingOfficeCard({ seller }: ListingOfficeCardProps) {
  const { t } = await getServerTranslations();
  const isOffice = seller.type === 'office';
  const isVerified = seller.verification_status === 'verified';
  const agent = isOffice ? seller.created_by : null;

  return (
    <div className="relative space-y-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-gray-100 sm:gap-6 sm:p-5">
      {isVerified ? (
        <span className="absolute -top-2.5 start-4 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-brand/20">
          <BadgeCheck className="h-3.5 w-3.5" />
          {t('detail.office.verified')}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          {isOffice && seller.photo_url ? (
            <Image src={seller.photo_url} alt={seller.name} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              {isOffice ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {isOffice ? t('detail.office.badge') : t('detail.office.individualBadge')}
          </p>
          <h3 className="truncate text-base font-bold text-primary-dark">{seller.name}</h3>
          {isOffice ? (
            <p className="truncate text-xs text-gray-500">
              {seller.neighborhood_name}, {seller.city_name}
            </p>
          ) : null}
        </div>
      </div>

      {agent ? (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {t('detail.office.listedBy')}
          </p>
          <p className="text-sm font-bold text-primary-dark">{agent.name}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${agent.phone_number}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
            >
              <Phone className="h-4 w-4 text-brand" />
              <span dir="ltr">{agent.phone_number}</span>
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
            >
              <Mail className="h-4 w-4 text-brand" />
              <span className="truncate">{agent.email}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <a
            href={`tel:${seller.phone_number}`}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
          >
            <Phone className="h-4 w-4 text-brand" />
            <span dir="ltr">{seller.phone_number}</span>
          </a>
          {isOffice ? (
            <a
              href={`mailto:${seller.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
            >
              <Mail className="h-4 w-4 text-brand" />
              <span className="truncate">{seller.email}</span>
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
