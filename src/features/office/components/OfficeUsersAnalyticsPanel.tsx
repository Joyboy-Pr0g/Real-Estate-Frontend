'use client';

import { useRouter } from 'next/navigation';
import { OfficeUserAnalytics, MyOffice, OfficeAnalyticsPeriod } from '@/features/office/types/office';
import { OfficeUserAnalyticsCard } from '@/features/office/components/OfficeUserAnalyticsCard';
import { OfficeUserAnalyticsTable } from '@/features/office/components/OfficeUserAnalyticsTable';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { createSearchMyOfficesForSelect } from '@/features/office/services/office-client';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { cn } from '@/lib/utils/cn';

const PERIOD_OPTIONS: OfficeAnalyticsPeriod[] = [
  'this_month',
  'last_three_months',
  'last_six_months',
  'last_year',
  'last_two_years',
];

interface OfficeUsersAnalyticsPanelProps {
  offices: MyOffice[];
  analytics: OfficeUserAnalytics | null;
  officeId?: string;
  period: OfficeAnalyticsPeriod;
}

export function OfficeUsersAnalyticsPanel({
  offices,
  analytics,
  officeId,
  period,
}: OfficeUsersAnalyticsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const selectedOffice = offices.find((office) => office.id === officeId) ?? offices[0];

  const pushFilters = (next: { office_id?: string; period?: OfficeAnalyticsPeriod }) => {
    const params = new URLSearchParams();
    const nextOfficeId = next.office_id ?? officeId ?? selectedOffice?.id;
    const nextPeriod = next.period ?? period;
    if (nextOfficeId) params.set('office_id', nextOfficeId);
    params.set('period', nextPeriod);
    router.push(`/dashboard/office/users?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {offices.length > 1 ? (
          <div className="min-w-[220px] space-y-1.5">
            <span className="text-xs font-medium text-gray-500">{t('dashboard.listings.selectOffice')}</span>
            <SearchableSelect
              value={officeId ?? selectedOffice?.id ?? ''}
              selectedLabel={selectedOffice?.name ?? ''}
              onChange={(id) => pushFilters({ office_id: id })}
              fetchOptions={createSearchMyOfficesForSelect(offices)}
              placeholder={t('dashboard.listings.selectOffice')}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => pushFilters({ period: option })}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                period === option
                  ? 'bg-brand-muted text-brand-dark'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {t(`dashboard.office.analyticsPeriod.${option}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {!analytics || analytics.users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
          {t('dashboard.office.noUserAnalyticsData')}
        </div>
      ) : (
        <>
          <OfficeUserAnalyticsTable users={analytics.users} />
          <div className="space-y-3 lg:hidden">
            {analytics.users.map((user, index) => (
              <OfficeUserAnalyticsCard key={user.user_id} user={user} rank={index + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
