'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { useLocale } from '@/lib/i18n/locale-provider';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnnouncementReadsChartProps {
  buckets: { bucket: string; count: number }[];
}

function formatBucketLabel(bucket: string, locale: string): string {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;
  return date.toLocaleString(locale === 'ar' ? 'ar-YE' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AnnouncementReadsChart({ buckets }: AnnouncementReadsChartProps) {
  const { locale } = useLocale();

  const labels = useMemo(() => buckets.map((b) => formatBucketLabel(b.bucket, locale)), [buckets, locale]);
  const series = useMemo(() => buckets.map((b) => b.count), [buckets]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        id: 'announcement-reads',
        type: 'area',
        height: 280,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
      },
      colors: ['#1e6b45'],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0.05 },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: labels,
        labels: { rotate: -35, style: { colors: '#6b7280', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { style: { colors: '#6b7280', fontSize: '11px' } },
      },
      tooltip: { theme: 'light' },
    }),
    [labels],
  );

  if (buckets.length === 0) {
    return null;
  }

  return (
    <Chart
      options={options}
      series={[{ name: 'Reads', data: series }]}
      type="area"
      height={280}
      width="100%"
    />
  );
}

interface BreakdownBarChartProps {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
}

export function BreakdownBarChart({ title, labels, values, color = '#1e6b45' }: BreakdownBarChartProps) {
  const options: ApexOptions = useMemo(
    () => ({
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
      plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '55%' } },
      colors: [color],
      dataLabels: { enabled: true, style: { fontSize: '11px' } },
      grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#6b7280', fontSize: '11px' } },
      },
      yaxis: { labels: { style: { colors: '#6b7280', fontSize: '11px' } } },
      title: { text: title, style: { fontSize: '14px', fontWeight: 600, color: '#111827' } },
    }),
    [color, labels, title],
  );

  if (values.every((v) => v === 0)) return null;

  return <Chart options={options} series={[{ name: title, data: values }]} type="bar" height={220} width="100%" />;
}
