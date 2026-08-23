import Link from 'next/link';
import { OfficeListingAnalytics } from '@/features/office/types/office';
import { getServerTranslations } from '@/lib/i18n/server';
import { formatPriceYER } from '@/lib/utils/currency';
import type { TranslationKey } from '@/lib/i18n/ar';

interface OfficeAnalyticsViewProps {
  analytics: OfficeListingAnalytics;
}

export async function OfficeAnalyticsView({ analytics }: OfficeAnalyticsViewProps) {
  const { t } = await getServerTranslations();
  const maxMonthly = Math.max(1, ...analytics.monthly.flatMap((point) => [point.sold, point.rented]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('dashboard.office.totalSold')}</p>
          <p className="mt-1 text-2xl font-bold text-primary-dark">{analytics.sold.count}</p>
          <p className="mt-1 text-sm text-gray-500">{formatPriceYER(analytics.sold.total_price)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('dashboard.office.totalRented')}</p>
          <p className="mt-1 text-2xl font-bold text-primary-dark">{analytics.rented.count}</p>
          <p className="mt-1 text-sm text-gray-500">{formatPriceYER(analytics.rented.total_price)}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.office.monthlyTrend')}</h2>

        {analytics.monthly.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">{t('dashboard.office.noAnalyticsData')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {analytics.monthly.map((point) => (
              <div key={point.month} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs font-medium text-gray-500">{point.month}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-brand"
                      style={{ width: `${(point.sold / maxMonthly) * 100}%`, minWidth: point.sold > 0 ? '0.5rem' : 0 }}
                    />
                    <span className="text-xs text-gray-400">{point.sold} {t('dashboard.listings.status.sold')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-amber-400"
                      style={{ width: `${(point.rented / maxMonthly) * 100}%`, minWidth: point.rented > 0 ? '0.5rem' : 0 }}
                    />
                    <span className="text-xs text-gray-400">{point.rented} {t('dashboard.listings.status.rented')}</span>
                  </div>
                </div>
              </div>
            ))}
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
                href={`/listings/${listing.slug}`}
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
