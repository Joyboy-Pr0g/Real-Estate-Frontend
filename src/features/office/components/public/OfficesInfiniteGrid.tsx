'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicOfficeSummary } from '@/features/office/types/public-office';
import { PublicOfficeCard } from '@/features/office/components/public/PublicOfficeCard';
import { bffPaths } from '@/lib/api/endpoints';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CarouselSkeleton } from '@/features/shared/components/LoadingSkeletons';

interface OfficesInfiniteGridProps {
  initialOffices: PublicOfficeSummary[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

interface OfficesApiResponse {
  success: boolean;
  data: PublicOfficeSummary[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

export function OfficesInfiniteGrid({
  initialOffices,
  initialCursor,
  initialHasMore,
}: OfficesInfiniteGridProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [offices, setOffices] = useState(initialOffices);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const queryKey = searchParams.toString();

  useEffect(() => {
    setOffices(initialOffices);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setError(false);
  }, [queryKey, initialOffices, initialCursor, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;

    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('cursor', cursor);

      const response = await fetch(`${bffPaths.offices.public}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await response.json()) as OfficesApiResponse;

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Request failed');
      }

      setOffices((prev) => [...prev, ...(json.data ?? [])]);
      setCursor(json.next_cursor ?? null);
      setHasMore(json.has_more ?? false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, searchParams]);

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
  }, [hasMore, loadMore, queryKey]);

  if (offices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">{t('offices.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {offices.map((office, index) => (
          <PublicOfficeCard key={office.id} office={office} priority={index < 3} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loading ? <CarouselSkeleton /> : null}
        {error ? (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        ) : null}
        {!hasMore && offices.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
