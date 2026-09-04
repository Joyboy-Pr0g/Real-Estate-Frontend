'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OfficeListingAnalytics, MyOffice, OfficeAnalyticsPeriod } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { createSearchMyOfficesForSelect } from '@/features/office/services/office-client';
import { OfficeAnalyticsTrendChart } from '@/features/office/components/OfficeAnalyticsTrendChart';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatPriceYER } from '@/lib/utils/currency';
import type { TranslationKey } from '@/lib/i18n/ar';
import { cn } from '@/lib/utils/cn';

const PERIOD_OPTIONS: OfficeAnalyticsPeriod[] = [
  'this_month',
  'last_three_months',
  'last_six_months',
  'last_year',
  'last_two_years',
];

interface OfficeAnalyticsPanelProps {
  offices: MyOffice[];
  cities: PublicCity[];
  analytics: OfficeListingAnalytics | null;
  officeId?: string;
  period: OfficeAnalyticsPeriod;
  cityId?: string;
}

export function OfficeAnalyticsPanel({
  offices,
  cities,
  analytics,
  officeId,
  period,
  cityId,
}: OfficeAnalyticsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const selectedOffice = offices.find((office) => office.id === officeId) ?? offices[0];
  const selectedCity = cities.find((city) => city.id === cityId);

  const pushFilters = (next: {
    office_id?: string;
    period?: OfficeAnalyticsPeriod;
    city_id?: string;
  }) => {
    const params = new URLSearchParams();
    const nextOfficeId = next.office_id ?? officeId ?? selectedOffice?.id;
    const nextPeriod = next.period ?? period;
    const nextCityId = next.city_id !== undefined ? next.city_id : cityId;
    if (nextOfficeId) params.set('office_id', nextOfficeId);
    params.set('period', nextPeriod);
    if (nextCityId) params.set('city_id', nextCityId);
    router.push(`/dashboard/office/analytics?${params.toString()}`);
  };

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
        {t('dashboard.office.noAnalyticsData')}
      </div>
    );
  }

  const soldPct = analytics.sold_percentage;
  const rentedPct = analytics.rented_percentage;
  const soldPricePct = analytics.sold_price_percentage;
  const rentedPricePct = analytics.rented_price_percentage;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
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

          <div className="min-w-[220px] space-y-1.5">
            <span className="text-xs font-medium text-gray-500">{t('admin.city')}</span>
            <select
              value={cityId ?? ''}
              onChange={(e) => pushFilters({ city_id: e.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white"
            >
              <option value="">{t('dashboard.office.allCities')}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {selectedCity ? (
              <p className="text-xs text-gray-400">{selectedCity.name}</p>
            ) : null}
          </div>
        </div>

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

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('dashboard.office.totalSold')}</p>
          <p className="mt-1 text-2xl font-bold text-primary-dark">{analytics.sold.count}</p>
          <p className="mt-1 text-sm text-gray-500">{formatPriceYER(analytics.sold.total_price)}</p>
          <p className="mt-2 text-xs text-brand-dark">{soldPct}% · {soldPricePct}% {t('dashboard.office.ofRevenue')}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('dashboard.office.totalRented')}</p>
          <p className="mt-1 text-2xl font-bold text-primary-dark">{analytics.rented.count}</p>
          <p className="mt-1 text-sm text-gray-500">{formatPriceYER(analytics.rented.total_price)}</p>
          <p className="mt-2 text-xs text-amber-700">{rentedPct}% · {rentedPricePct}% {t('dashboard.office.ofRevenue')}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
          <p className="mb-4 text-xs font-medium text-gray-400">{t('dashboard.office.analyticsDistribution')}</p>
          <div className="flex items-center gap-6">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full"
              style={{
                background: `conic-gradient(#1e6b45 0 ${soldPct}%, #d97706 ${soldPct}% ${soldPct + rentedPct}%, #e5e7eb ${soldPct + rentedPct}% 100%)`,
              }}
              aria-hidden
            >
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-center">
                <span className="text-xs font-semibold text-primary-dark">
                  {soldPct + rentedPct > 0 ? `${soldPct}/${rentedPct}` : '—'}
                </span>
              </div>
            </div>
            <div className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  <span>{t('dashboard.listings.status.sold')} — {soldPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>{t('dashboard.listings.status.rented')} — {rentedPct}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span>{t('dashboard.office.soldPricePercentage')} — {soldPricePct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span>{t('dashboard.office.rentedPricePercentage')} — {rentedPricePct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.office.monthlyTrend')}</h2>
        {analytics.monthly.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">{t('dashboard.office.noAnalyticsData')}</p>
        ) : (
          <div className="mt-4">
            <OfficeAnalyticsTrendChart monthly={analytics.monthly} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.office.topListings')}</h2>
        {analytics.top_listings.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">{t('dashboard.office.noAnalyticsData')}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {analytics.top_listings.map((listing) => (
              <Link
                key={`${listing.listing_id}-${listing.started_at}`}
                href={`/dashboard/office/listings/${listing.listing_id}`}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
              >
                <span className="min-w-0 truncate font-medium text-primary-dark">{listing.title}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {t(`dashboard.listings.status.${listing.action}` as TranslationKey)}
                </span>
                <span className="shrink-0 font-semibold text-brand-dark">{formatPriceYER(listing.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
