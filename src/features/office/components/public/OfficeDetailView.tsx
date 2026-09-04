'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Building2, ChevronLeft, Mail, MapPin, Phone, Users } from 'lucide-react';
import { PublicOfficeDetail } from '@/features/office/types/public-office';
import { OfficeMemberCard } from '@/features/office/components/public/OfficeMemberCard';
import { OfficeListingsInfiniteGrid } from '@/features/office/components/public/OfficeListingsInfiniteGrid';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficeDetailViewProps {
  office: PublicOfficeDetail;
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

export function OfficeDetailView({
  office,
  initialListings,
  initialCursor,
  initialHasMore,
}: OfficeDetailViewProps) {
  const { t } = useLocale();
  const isVerified = office.verification_status === 'verified';

  return (
    <div className="space-y-10">
      <Link
        href="/offices"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-brand-dark"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        {t('offices.backToList')}
      </Link>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative min-h-[260px] bg-gray-100 lg:min-h-[360px]">
            {office.office_photo_url ? (
              <Image
                src={office.office_photo_url}
                alt={office.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center text-gray-300">
                <Building2 className="h-20 w-20" strokeWidth={1.1} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
            <div>
              {isVerified ? (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-brand-muted px-3 py-1 text-xs font-semibold text-brand-dark">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {t('offices.verified')}
                </span>
              ) : null}
              <h1 className="text-2xl font-bold text-primary-dark sm:text-3xl">{office.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-brand" />
                {office.city}, {office.neighborhood}
              </p>
              <p className="mt-1 text-sm text-gray-500">{office.address}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${office.phone_number}`}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
              >
                <Phone className="h-4 w-4 text-brand" />
                <span dir="ltr">{office.phone_number}</span>
              </a>
              <a
                href={`mailto:${office.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted"
              >
                <Mail className="h-4 w-4 text-brand" />
                <span className="max-w-[220px] truncate">{office.email}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-bold text-primary-dark">{t('offices.detail.teamTitle')}</h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            {office.members.length}
          </span>
        </div>

        {office.members.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {office.members.map((member) => (
              <OfficeMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-gray-500">{t('offices.detail.noTeam')}</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-primary-dark">{t('offices.detail.listingsTitle')}</h2>
        <OfficeListingsInfiniteGrid
          officeName={office.name}
          initialListings={initialListings}
          initialCursor={initialCursor}
          initialHasMore={initialHasMore}
        />
      </section>
    </div>
  );
}
