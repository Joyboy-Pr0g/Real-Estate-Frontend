'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Loader2, TrendingUp } from 'lucide-react';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';
import {
  ListingMetricsResponse,
  ListingRentSource,
  ListingRentSourceKind,
} from '@/features/listings/types/listing-metrics';
import {
  CashFlowChart,
  DownPaymentChart,
  RentSourcesChart,
} from '@/features/listings/components/detail/ListingMetricsCharts';
import { formatPriceYER } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

interface ListingMetricsTabProps {
  listingId: string;
}

const RENT_SOURCE_ORDER: ListingRentSourceKind[] = ['office', 'market', 'market_city', 'history'];

function computeMonthlyInstallment(price: number, downPct: number, years: number): number {
  const financed = price * (1 - downPct / 100);
  if (financed <= 0 || years <= 0) return 0;
  return financed / (years * 12);
}

function getRentSourceHint(
  source: ListingRentSource,
  t: (key: TranslationKey) => string,
): string {
  const hintKey = `detail.metrics.sourceHint.${source.source}` as TranslationKey;

  if (source.source === 'market' && source.sample_count) {
    return t('detail.metrics.marketSample').replace('{count}', String(source.sample_count));
  }
  if (source.source === 'market_city' && source.sample_count) {
    return t('detail.metrics.citySample').replace('{count}', String(source.sample_count));
  }
  if (source.source === 'office') {
    return t('detail.metrics.officeEstimate');
  }
  if (source.recorded_at) {
    return t('detail.metrics.historyRecorded').replace('{date}', formatDateTime(source.recorded_at));
  }
  return t(hintKey);
}

export function ListingMetricsTab({ listingId }: ListingMetricsTabProps) {
  const { t } = useLocale();
  const [metrics, setMetrics] = useState<ListingMetricsResponse | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [errorFor, setErrorFor] = useState<string | null>(null);

  const loading = loadedFor !== listingId && errorFor !== listingId;
  const error = errorFor === listingId;

  const [downPct, setDownPct] = useState(5);
  const [years, setYears] = useState(10);

  useEffect(() => {
    let cancelled = false;

    clientFetch<ListingMetricsResponse>(bffPaths.listings.metrics(listingId))
      .then((res) => {
        if (!cancelled) {
          setMetrics(res.data ?? null);
          if (res.data?.installment_defaults) {
            setDownPct(res.data.installment_defaults.min_down_pct);
            setYears(res.data.installment_defaults.default_years);
          }
          setLoadedFor(listingId);
          setErrorFor(null);
        }
      })
      .catch(() => {
        if (!cancelled) setErrorFor(listingId);
      });

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const price = metrics ? Number(metrics.price) : 0;
  const maxYears = metrics?.installment_defaults.max_years ?? 30;
  const minDownPct = metrics?.installment_defaults.min_down_pct ?? 5;

  const monthlyInstallment = useMemo(
    () => computeMonthlyInstallment(price, downPct, years),
    [price, downPct, years],
  );

  const estimatedRent = metrics?.final_estimated_rent ? Number(metrics.final_estimated_rent) : null;
  const netMonthly =
    estimatedRent !== null && !Number.isNaN(estimatedRent)
      ? monthlyInstallment - estimatedRent
      : null;

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        {t('detail.metrics.loadError')}
      </p>
    );
  }

  if (!metrics.eligible) {
    return (
      <p className="text-sm text-gray-500">{t('detail.metrics.notEligible')}</p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand" />
          <h3 className="text-base font-bold text-primary-dark">{t('detail.metrics.rentTitle')}</h3>
        </div>

        <RentSourcesChart metrics={metrics} />

        <ul className="grid gap-2 sm:grid-cols-2">
          {RENT_SOURCE_ORDER.map((kind) => {
            const source = metrics.rent_sources[kind];
            const labelKey = `detail.metrics.source.${kind}` as const;

            return (
              <li
                key={kind}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs',
                  source.available
                    ? 'bg-gray-50 text-gray-600 ring-1 ring-gray-100'
                    : 'bg-gray-50/40 text-gray-400 ring-1 ring-dashed ring-gray-200',
                )}
              >
                <span className="font-semibold text-primary-dark">{t(labelKey)}: </span>
                {source.available && source.value ? (
                  <>
                    {formatPriceYER(source.value, metrics.yer_variant)}
                    <span className="mt-0.5 block text-[11px] text-gray-400">
                      {getRentSourceHint(source, t)}
                    </span>
                  </>
                ) : (
                  t('detail.metrics.sourceUnavailable')
                )}
              </li>
            );
          })}
        </ul>

        {metrics.has_sufficient_rent_data ? (
          <div className="rounded-xl border border-brand/20 bg-brand-muted/40 px-4 py-3">
            <p className="text-xs font-medium text-gray-500">{t('detail.metrics.finalRent')}</p>
            <p className="text-xl font-bold text-brand-dark">
              {formatPriceYER(metrics.final_estimated_rent ?? '0', metrics.yer_variant)}
            </p>
            <p className="mt-1 text-xs text-gray-500">{t('detail.metrics.finalRentHint')}</p>
          </div>
        ) : (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('detail.metrics.noRentData')}
          </p>
        )}
      </section>

      {metrics.accepts_installment ? (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand" />
            <h3 className="text-base font-bold text-primary-dark">{t('detail.metrics.installmentTitle')}</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary-dark">{t('detail.metrics.downPayment')}</span>
                <span className="font-semibold text-brand-dark">{downPct}%</span>
              </div>
              <input
                type="range"
                min={minDownPct}
                max={100}
                step={1}
                value={downPct}
                onChange={(e) => setDownPct(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brand"
              />
              <p className="text-xs text-gray-500">
                {formatPriceYER((price * downPct) / 100, metrics.yer_variant)}
              </p>
            </label>

            <label className="block space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary-dark">{t('detail.metrics.years')}</span>
                <span className="font-semibold text-brand-dark">
                  {years} {t('detail.metrics.yearsUnit')}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={maxYears}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-brand"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DownPaymentChart price={price} downPct={downPct} yerVariant={metrics.yer_variant} />
            <CashFlowChart
              monthlyInstallment={monthlyInstallment}
              estimatedRent={estimatedRent}
              netMonthly={netMonthly}
              yerVariant={metrics.yer_variant}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{t('detail.metrics.monthlyInstallment')}</p>
              <p className="text-xl font-bold text-primary-dark">
                {formatPriceYER(monthlyInstallment, metrics.yer_variant)}
              </p>
              <p className="mt-1 text-xs text-gray-400">{t('detail.metrics.zeroInterestNote')}</p>
            </div>

            {netMonthly !== null ? (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3',
                  netMonthly <= 0
                    ? 'border-emerald-100 bg-emerald-50/60'
                    : 'border-amber-100 bg-amber-50/60',
                )}
              >
                <p className="text-xs font-medium text-gray-500">{t('detail.metrics.netMonthly')}</p>
                <p
                  className={cn(
                    'text-xl font-bold',
                    netMonthly <= 0 ? 'text-emerald-700' : 'text-amber-700',
                  )}
                >
                  {formatPriceYER(Math.abs(netMonthly), metrics.yer_variant)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {netMonthly <= 0
                    ? t('detail.metrics.positiveCashFlow')
                    : t('detail.metrics.negativeCashFlow')}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : metrics.has_sufficient_rent_data ? null : (
        <p className="text-sm text-gray-500">{t('detail.metrics.noInstallment')}</p>
      )}
    </div>
  );
}
