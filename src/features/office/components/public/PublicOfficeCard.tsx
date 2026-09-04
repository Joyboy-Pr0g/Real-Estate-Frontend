'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Building2, Mail, MapPin, Phone } from 'lucide-react';
import { PublicOfficeSummary } from '@/features/office/types/public-office';
import { getOfficePublicPath } from '@/features/office/lib/office-url';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PublicOfficeCardProps {
  office: PublicOfficeSummary;
  priority?: boolean;
}

export function PublicOfficeCard({ office, priority = false }: PublicOfficeCardProps) {
  const { t } = useLocale();
  const isVerified = office.verification_status === 'verified';
  const officeHref = getOfficePublicPath(office.name);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]">
      <Link href={officeHref} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {office.office_photo_url ? (
            <Image
              src={office.office_photo_url}
              alt={office.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-16 w-16" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {isVerified ? (
            <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('offices.verified')}
            </span>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="truncate text-lg font-bold text-white">{office.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {office.city}, {office.neighborhood}
              </span>
            </p>
          </div>
        </div>

        <p className="line-clamp-2 px-4 pt-3 text-sm text-gray-500">{office.address}</p>
      </Link>

      <div className="mt-auto flex flex-wrap gap-2 p-4 pt-3">
        <a
          href={`tel:${office.phone_number}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
        >
          <Phone className="h-3.5 w-3.5 text-brand" />
          <span dir="ltr">{office.phone_number}</span>
        </a>
        <a
          href={`mailto:${office.email}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
        >
          <Mail className="h-3.5 w-3.5 shrink-0 text-brand" />
          <span className="truncate">{office.email}</span>
        </a>
      </div>
    </article>
  );
}
