'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MyListingReport } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { bffPaths } from '@/lib/api/endpoints';
import type { TranslationKey } from '@/lib/i18n/ar';

interface MyReportsListProps {
  initialItems: MyListingReport[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

interface CursorApiResponse {
  success: boolean;
  data: MyListingReport[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

const STATUS_STYLES: Record<MyListingReport['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  resolved: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  dismissed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

export function MyReportsList({ initialItems, initialCursor, initialHasMore }: MyReportsListProps) {
  const { t } = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;

    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({ cursor });
      const response = await fetch(`${bffPaths.listings.myReports}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await response.json()) as CursorApiResponse;

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Request failed');
      }

      setItems((prev) => [...prev, ...(json.data ?? [])]);
      setCursor(json.next_cursor ?? null);
      setHasMore(json.has_more ?? false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '240px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">{t('dashboard.reports.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((report) => (
        <div key={report.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/listings/${report.listing_slug}`}
                className="truncate text-sm font-bold text-primary-dark hover:text-brand-dark"
              >
                {report.listing_title}
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                {t(`dashboard.report.reason.${report.reason}` as TranslationKey)}
              </p>
              {report.description ? (
                <p className="mt-1 text-sm text-gray-600">{report.description}</p>
              ) : null}
              {report.admin_notes ? (
                <div className="mt-3 rounded-xl bg-brand-muted/40 px-3 py-2">
                  <p className="text-xs font-medium text-brand-dark">{t('dashboard.report.adminResponse')}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-primary-dark">{report.admin_notes}</p>
                </div>
              ) : null}
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                STATUS_STYLES[report.status],
              )}
            >
              {t(`dashboard.report.status.${report.status}` as TranslationKey)}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-400">{formatDateTime(report.created_at)}</p>
        </div>
      ))}

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loading ? <p className="text-xs text-gray-400">…</p> : null}
        {error ? (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        ) : null}
        {!hasMore && items.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
