'use client';

import { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfficeApplicationForm } from '@/features/office/components/OfficeApplicationForm';
import { IndividualApplicationForm } from '@/features/individual-lister/components/IndividualApplicationForm';
import { MyOffice } from '@/features/office/types/office';
import { IndividualListerProfile } from '@/features/individual-lister/types/individual-lister';
import { PublicCity } from '@/features/catalog/types/catalog';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

interface BecomeAListerPanelProps {
  individualProfile: IndividualListerProfile | null;
  offices: MyOffice[];
  cities: PublicCity[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        STATUS_STYLES[status],
      )}
    >
      {t(`dashboard.verification.${status}` as TranslationKey)}
    </span>
  );
}

export function BecomeAListerPanel({ individualProfile, offices, cities }: BecomeAListerPanelProps) {
  const { t } = useLocale();
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);

  const office = offices[0] ?? null;
  const canApplyOffice = !office || office.verification_status === 'rejected';
  const canApplyIndividual = !office && (!individualProfile || individualProfile.verification_status === 'rejected');

  return (
    <div className={cn('grid gap-6', office ? 'sm:grid-cols-1' : 'sm:grid-cols-2')}>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-primary-dark">{t('dashboard.office.title')}</h2>
            <p className="text-xs text-gray-500">{t('dashboard.office.hint')}</p>
          </div>
        </div>

        <div className="mt-4">
          {office ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate font-semibold text-primary-dark">{office.name}</p>
                <StatusBadge status={office.verification_status} />
              </div>
              {office.verification_status === 'rejected' && office.rejected_reason ? (
                <p className="text-sm text-red-600">
                  {t('dashboard.rejectedReason')}: {office.rejected_reason}
                </p>
              ) : null}
              {canApplyOffice && !showOfficeForm ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowOfficeForm(true)}>
                  {t('dashboard.applyAgain')}
                </Button>
              ) : null}
            </div>
          ) : !showOfficeForm ? (
            <Button type="button" onClick={() => setShowOfficeForm(true)}>
              {t('dashboard.office.applyButton')}
            </Button>
          ) : null}

          {showOfficeForm && canApplyOffice ? (
            <OfficeApplicationForm cities={cities} existingOffice={office} onCancel={() => setShowOfficeForm(false)} />
          ) : null}
        </div>
      </section>

      {!office ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-primary-dark">{t('dashboard.individual.title')}</h2>
              <p className="text-xs text-gray-500">{t('dashboard.individual.hint')}</p>
            </div>
          </div>

          <div className="mt-4">
            {individualProfile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-primary-dark">{t('dashboard.individual.title')}</p>
                  <StatusBadge status={individualProfile.verification_status} />
                </div>
                {individualProfile.verification_status === 'rejected' && individualProfile.rejected_reason ? (
                  <p className="text-sm text-red-600">
                    {t('dashboard.rejectedReason')}: {individualProfile.rejected_reason}
                  </p>
                ) : null}
                {canApplyIndividual && !showIndividualForm ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowIndividualForm(true)}>
                    {t('dashboard.applyAgain')}
                  </Button>
                ) : null}
              </div>
            ) : !showIndividualForm ? (
              <Button type="button" onClick={() => setShowIndividualForm(true)}>
                {t('dashboard.individual.applyButton')}
              </Button>
            ) : null}

            {showIndividualForm && canApplyIndividual ? (
              <IndividualApplicationForm onCancel={() => setShowIndividualForm(false)} />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
