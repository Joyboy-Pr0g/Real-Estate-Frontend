'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { OfficeAnalyticsMonthlyPoint } from '@/features/office/types/office';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CHART_COLORS = {
  sold: '#1e6b45',
  rented: '#d97706',
  soldPrice: '#86efac',
  rentedPrice: '#fcd34d',
};

function formatMonthLabel(month: string, locale: string) {
  const [year, monthPart] = month.split('-');
  const date = new Date(Number(year), Number(monthPart) - 1, 1);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US', { month: 'short', year: '2-digit' });
}

interface OfficeAnalyticsTrendChartProps {
  monthly: OfficeAnalyticsMonthlyPoint[];
}

export function OfficeAnalyticsTrendChart({ monthly }: OfficeAnalyticsTrendChartProps) {
  const { t, locale } = useLocale();

  const labels = useMemo(
    () => monthly.map((point) => formatMonthLabel(point.month, locale)),
    [monthly, locale],
  );

  const soldSeries = useMemo(() => monthly.map((point) => point.sold), [monthly]);
  const rentedSeries = useMemo(() => monthly.map((point) => point.rented), [monthly]);
  const soldPricePctSeries = useMemo(() => monthly.map((point) => point.sold_price_percentage), [monthly]);
  const rentedPricePctSeries = useMemo(() => monthly.map((point) => point.rented_price_percentage), [monthly]);

  const mainOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: 'office-analytics-main',
        type: 'line',
        height: 340,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
      },
      colors: [CHART_COLORS.sold, CHART_COLORS.rented, CHART_COLORS.soldPrice, CHART_COLORS.rentedPrice],
      stroke: {
        curve: 'smooth',
        width: [3, 3, 2, 2],
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '12px',
        markers: { size: 6 },
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: { colors: '#6b7280', fontSize: '11px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          seriesName: [
            t('dashboard.listings.status.sold'),
            t('dashboard.listings.status.rented'),
          ],
          title: { text: t('dashboard.office.analyticsCountAxis'), style: { color: '#6b7280', fontSize: '11px' } },
          labels: { style: { colors: '#6b7280', fontSize: '11px' } },
          min: 0,
          forceNiceScale: true,
        },
        {
          seriesName: [
            t('dashboard.office.soldPricePercentage' as TranslationKey),
            t('dashboard.office.rentedPricePercentage' as TranslationKey),
          ],
          opposite: true,
          title: { text: t('dashboard.office.analyticsPricePercentAxis'), style: { color: '#6b7280', fontSize: '11px' } },
          labels: {
            style: { colors: '#6b7280', fontSize: '11px' },
            formatter: (value) => `${Math.round(Number(value))}%`,
          },
          min: 0,
          max: 100,
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value, opts) => {
            const index = opts?.seriesIndex ?? 0;
            if (index >= 2) return `${Math.round(Number(value))}%`;
            return `${Math.round(Number(value))}`;
          },
        },
      },
    }),
    [labels, t],
  );

  const brushOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: 'office-analytics-brush',
        height: 120,
        type: 'area',
        brush: {
          target: 'office-analytics-main',
          enabled: true,
        },
        selection: {
          enabled: true,
          fill: { color: '#1e6b45', opacity: 0.08 },
          stroke: { color: '#1e6b45', width: 1, dashArray: 3 },
          xaxis: {
            min: 0,
            max: Math.max(labels.length - 1, 1),
          },
        },
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      colors: [CHART_COLORS.sold, CHART_COLORS.rented],
      stroke: { curve: 'smooth', width: 1 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        padding: { top: -8, bottom: 0 },
      },
      xaxis: {
        categories: labels,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: { show: false },
        min: 0,
        forceNiceScale: true,
      },
    }),
    [labels],
  );

  const mainSeries = useMemo(
    () => [
      { name: t('dashboard.listings.status.sold'), type: 'line' as const, data: soldSeries },
      { name: t('dashboard.listings.status.rented'), type: 'line' as const, data: rentedSeries },
      {
        name: t('dashboard.office.soldPricePercentage' as TranslationKey),
        type: 'line' as const,
        data: soldPricePctSeries,
      },
      {
        name: t('dashboard.office.rentedPricePercentage' as TranslationKey),
        type: 'line' as const,
        data: rentedPricePctSeries,
      },
    ],
    [t, soldSeries, rentedSeries, soldPricePctSeries, rentedPricePctSeries],
  );

  const brushSeries = useMemo(
    () => [
      { name: t('dashboard.listings.status.sold'), data: soldSeries },
      { name: t('dashboard.listings.status.rented'), data: rentedSeries },
    ],
    [t, soldSeries, rentedSeries],
  );

  if (monthly.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <Chart options={mainOptions} series={mainSeries} type="line" height={340} />
      <Chart options={brushOptions} series={brushSeries} type="area" height={120} />
      <p className="text-center text-xs text-gray-400">{t('dashboard.office.analyticsBrushHint')}</p>
    </div>
  );
}
