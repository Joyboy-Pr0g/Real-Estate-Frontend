'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfficeProfileForm } from '@/features/office/components/OfficeProfileForm';
import { OfficeDetail, OfficeUserRole } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

interface OfficeProfilePanelProps {
  office: OfficeDetail;
  myRole: OfficeUserRole | null;
  cities: PublicCity[];
  initialNeighborhoods: PublicNeighborhood[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

export function OfficeProfilePanel({ office, myRole, cities, initialNeighborhoods }: OfficeProfilePanelProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const canEdit = myRole === 'office_admin';

  if (editing) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-base font-bold text-primary-dark">{t('dashboard.office.editTitle')}</h2>
        <OfficeProfileForm
          office={office}
          cities={cities}
          initialNeighborhoods={initialNeighborhoods}
          onDone={() => setEditing(false)}
        />
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {office.office_photo?.url ? (
                <Image src={office.office_photo.url} alt={office.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-primary-dark">{office.name}</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                  STATUS_STYLES[office.verification_status],
                )}
              >
                {t(`dashboard.verification.${office.verification_status}` as TranslationKey)}
              </span>
            </div>
          </div>

          {canEdit ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t('admin.edit')}
            </Button>
          ) : null}
        </div>

        {office.verification_status === 'rejected' && office.rejected_reason ? (
          <p className="mt-3 text-sm text-red-600">
            {t('dashboard.rejectedReason')}: {office.rejected_reason}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-400">{t('auth.phone')}</dt>
            <dd className="text-sm font-medium text-primary-dark">{office.phone_number}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">{t('dashboard.emailLabel')}</dt>
            <dd className="text-sm font-medium text-primary-dark">{office.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">{t('admin.city')}</dt>
            <dd className="text-sm font-medium text-primary-dark">{office.city.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">{t('dashboard.neighborhood')}</dt>
            <dd className="text-sm font-medium text-primary-dark">{office.neighborhood.name}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-400">{t('dashboard.address')}</dt>
            <dd className="text-sm font-medium text-primary-dark">{office.address}</dd>
          </div>
        </dl>
      </section>

      {office.documents ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.office.documents')}</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {(
              [
                ['id', office.documents.id.url],
                ['officeLicense', office.documents.office_license.url],
                ['commercialLicense', office.documents.commercial_license.url],
              ] as const
            ).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-brand-dark hover:bg-brand-muted"
              >
                {t(`dashboard.office.doc.${key}` as TranslationKey)}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
