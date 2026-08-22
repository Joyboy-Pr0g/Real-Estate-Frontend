import Image from 'next/image';
import { BadgeCheck, Building2, Mail, Phone } from 'lucide-react';
import { ListingDetailOffice } from '@/features/listings/types/listing-detail';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingOfficeCardProps {
  office: ListingDetailOffice;
}

export async function ListingOfficeCard({ office }: ListingOfficeCardProps) {
  const { t } = await getServerTranslations();
  const isVerified = office.verification_status === 'verified';

  return (
    <div className="relative flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-gray-100 sm:gap-6 sm:p-5">
      {isVerified ? (
        <span className="absolute -top-2.5 start-4 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-brand/20">
          <BadgeCheck className="h-3.5 w-3.5" />
          {t('detail.office.verified')}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          {office.office_photo_url ? (
            <Image src={office.office_photo_url} alt={office.name} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {t('detail.office.badge')}
          </p>
          <h3 className="truncate text-base font-bold text-primary-dark">{office.name}</h3>
          <p className="truncate text-xs text-gray-500">
            {office.neighborhood_name}, {office.city_name}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        <a
          href={`tel:${office.phone_number}`}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
        >
          <Phone className="h-4 w-4 text-brand" />
          <span dir="ltr">{office.phone_number}</span>
        </a>
        <a
          href={`mailto:${office.email}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
        >
          <Mail className="h-4 w-4" />
          {t('detail.office.sendMessage')}
        </a>
      </div>
    </div>
  );
}
