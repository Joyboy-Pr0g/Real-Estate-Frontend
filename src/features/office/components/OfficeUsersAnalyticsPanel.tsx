'use client';

import { useRouter } from 'next/navigation';
import { OfficeUserAnalytics, MyOffice, OfficeAnalyticsPeriod } from '@/features/office/types/office';
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80 text-start text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t('dashboard.office.userAnalyticsMember')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.listings.status.sold')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.listings.status.rented')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.office.userAnalyticsTotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.users.map((user, index) => (
                <tr key={user.user_id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand-dark">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-primary-dark">{user.f_name} {user.l_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-dark">{user.sold_count}</td>
                  <td className="px-4 py-3 font-medium text-primary-dark">{user.rented_count}</td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">{user.total_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
