'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import {
  ListingMetricsResponse,
  ListingRentSourceKind,
} from '@/features/listings/types/listing-metrics';
import { YerVariant } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CHART_COLORS = {
  office: '#1e6b45',
  market: '#059669',
  market_city: '#34d399',
  history: '#d97706',
  final: '#1e3a5f',
  unavailable: '#e5e7eb',
  downPayment: '#1e6b45',
  financed: '#86efac',
  installment: '#1e6b45',
  rent: '#d97706',
  netPositive: '#059669',
  netNegative: '#dc2626',
};

const RENT_SOURCE_ORDER: ListingRentSourceKind[] = ['office', 'market', 'market_city', 'history'];

function formatCompactAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-YE' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function baseChartOptions(locale: string): Pick<ApexOptions, 'chart' | 'grid' | 'tooltip'> {
  return {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => formatCompactAmount(Number(value), locale),
      },
    },
  };
}

interface RentSourcesChartProps {
  metrics: ListingMetricsResponse;
}

export function RentSourcesChart({ metrics }: RentSourcesChartProps) {
  const { t, locale } = useLocale();

  const labels = useMemo(
    () => RENT_SOURCE_ORDER.map((kind) => t(`detail.metrics.source.${kind}` as TranslationKey)),
    [t],
  );

  const { values, colors } = useMemo(() => {
    const vals: number[] = [];
    const cols: string[] = [];

    for (const kind of RENT_SOURCE_ORDER) {
      const source = metrics.rent_sources[kind];
      if (source.available && source.value) {
        vals.push(Number(source.value));
        cols.push(CHART_COLORS[kind]);
      } else {
        vals.push(0);
        cols.push(CHART_COLORS.unavailable);
      }
    }

    if (metrics.has_sufficient_rent_data && metrics.final_estimated_rent) {
      return {
        values: [...vals, Number(metrics.final_estimated_rent)],
        colors: [...cols, CHART_COLORS.final],
      };
    }

    return { values: vals, colors: cols };
  }, [metrics]);

  const categories = useMemo(() => {
    if (metrics.has_sufficient_rent_data && metrics.final_estimated_rent) {
      return [...labels, t('detail.metrics.finalRent')];
    }
    return labels;
  }, [labels, metrics, t]);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions(locale),
      chart: {
        ...baseChartOptions(locale).chart,
        id: 'listing-metrics-rent',
        type: 'bar',
        height: Math.max(220, categories.length * 48),
      },
      colors,
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '62%',
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => {
          const num = Number(value);
          if (num <= 0) return t('detail.metrics.sourceUnavailable');
          return formatCompactAmount(num, locale);
        },
        style: { fontSize: '11px', fontWeight: 600 },
        offsetX: 4,
      },
      legend: { show: false },
      xaxis: {
        labels: {
          style: { colors: '#6b7280', fontSize: '11px' },
          formatter: (value) => formatCompactAmount(Number(value), locale),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#374151', fontSize: '11px', fontWeight: 500 },
        },
      },
      tooltip: {
        ...baseChartOptions(locale).tooltip,
        y: {
          formatter: (value, opts) => {
            const num = Number(value);
            if (num <= 0) return t('detail.metrics.sourceUnavailable');
            const idx = opts?.dataPointIndex ?? 0;
            const kind = RENT_SOURCE_ORDER[idx];
            if (kind && metrics.rent_sources[kind]?.available) {
              return formatPriceYER(num, metrics.yer_variant);
            }
            if (idx === categories.length - 1 && metrics.final_estimated_rent) {
              return formatPriceYER(num, metrics.yer_variant);
            }
            return t('detail.metrics.sourceUnavailable');
          },
        },
      },
    }),
    [categories, colors, locale, metrics, t],
  );

  const series = useMemo(() => [{ name: t('detail.metrics.rentTitle'), data: values }], [t, values]);

  const hasAnyBar = values.some((v) => v > 0);
  if (!hasAnyBar) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-2">
      <Chart options={options} series={series} type="bar" height={options.chart?.height as number} />
    </div>
  );
}

interface DownPaymentChartProps {
  price: number;
  downPct: number;
  yerVariant: YerVariant;
}

export function DownPaymentChart({ price, downPct, yerVariant }: DownPaymentChartProps) {
  const { t, locale } = useLocale();

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions(locale),
      chart: {
        ...baseChartOptions(locale).chart,
        id: 'listing-metrics-down-payment',
        type: 'donut',
        height: 260,
      },
      colors: [CHART_COLORS.downPayment, CHART_COLORS.financed],
      labels: [t('detail.metrics.downPayment'), t('detail.metrics.financedAmount')],
      stroke: { width: 2, colors: ['#fff'] },
      dataLabels: {
        enabled: true,
        formatter: (value) => `${Math.round(Number(value))}%`,
        style: { fontSize: '12px', fontWeight: 600 },
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        markers: { size: 6 },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              total: {
                show: true,
                label: t('detail.metrics.purchasePrice'),
                formatter: () => formatCompactAmount(price, locale),
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => formatPriceYER((price * Number(value)) / 100, yerVariant),
        },
      },
    }),
    [locale, price, t, yerVariant],
  );

  const series = useMemo(
    () => [downPct, Math.max(0, 100 - downPct)],
    [downPct],
  );

  if (price <= 0) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-2">
      <Chart options={options} series={series} type="donut" height={260} />
    </div>
  );
}

interface CashFlowChartProps {
  monthlyInstallment: number;
  estimatedRent: number | null;
  netMonthly: number | null;
  yerVariant: YerVariant;
}

export function CashFlowChart({
  monthlyInstallment,
  estimatedRent,
  netMonthly,
  yerVariant,
}: CashFlowChartProps) {
  const { t, locale } = useLocale();

  const categories = useMemo(() => {
    const items = [t('detail.metrics.monthlyInstallment')];
    if (estimatedRent !== null) items.push(t('detail.metrics.estimatedRentShort'));
    if (netMonthly !== null) items.push(t('detail.metrics.netMonthly'));
    return items;
  }, [estimatedRent, netMonthly, t]);

  const values = useMemo(() => {
    const items = [monthlyInstallment];
    if (estimatedRent !== null) items.push(estimatedRent);
    if (netMonthly !== null) items.push(Math.abs(netMonthly));
    return items;
  }, [estimatedRent, monthlyInstallment, netMonthly]);

  const colors = useMemo(() => {
    const items = [CHART_COLORS.installment];
    if (estimatedRent !== null) items.push(CHART_COLORS.rent);
    if (netMonthly !== null) {
      items.push(netMonthly <= 0 ? CHART_COLORS.netPositive : CHART_COLORS.netNegative);
    }
    return items;
  }, [estimatedRent, netMonthly]);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions(locale),
      chart: {
        ...baseChartOptions(locale).chart,
        id: 'listing-metrics-cash-flow',
        type: 'bar',
        height: 280,
      },
      colors,
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '48%',
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => formatCompactAmount(Number(value), locale),
        style: { fontSize: '11px', fontWeight: 600 },
        offsetY: -6,
      },
      legend: { show: false },
      xaxis: {
        categories,
        labels: {
          style: { colors: '#374151', fontSize: '11px', fontWeight: 500 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#6b7280', fontSize: '11px' },
          formatter: (value) => formatCompactAmount(Number(value), locale),
        },
        min: 0,
        forceNiceScale: true,
      },
      tooltip: {
        y: {
          formatter: (value, opts) => {
            const num = Number(value);
            const idx = opts?.dataPointIndex ?? 0;
            if (idx === 2 && netMonthly !== null && netMonthly > 0) {
              return `${formatPriceYER(num, yerVariant)} (${t('detail.metrics.negativeCashFlow')})`;
            }
            if (idx === 2 && netMonthly !== null && netMonthly <= 0) {
              return `${formatPriceYER(num, yerVariant)} (${t('detail.metrics.positiveCashFlow')})`;
            }
            return formatPriceYER(num, yerVariant);
          },
        },
      },
    }),
    [categories, colors, locale, netMonthly, t, yerVariant],
  );

  const series = useMemo(
    () => [{ name: t('detail.metrics.cashFlowSeries'), data: values }],
    [t, values],
  );

  if (monthlyInstallment <= 0) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-2">
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
}
