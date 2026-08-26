'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListingGrid } from '@/features/listings/components/ListingGrid';
import { checkSavedListingIds } from '@/features/listings/services/listing-client';
import { PublicListing } from '@/features/listings/types/listing';
import { bffPaths } from '@/lib/api/endpoints';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CarouselSkeleton } from '@/features/shared/components/LoadingSkeletons';

interface ListingsInfiniteGridProps {
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

interface SearchApiResponse {
  success: boolean;
  data: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

export function ListingsInfiniteGrid({
  initialListings,
  initialCursor,
  initialHasMore,
}: ListingsInfiniteGridProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [listings, setListings] = useState(initialListings);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const queryKey = searchParams.toString();

  useEffect(() => {
    setListings(initialListings);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setError(false);
  }, [queryKey, initialListings, initialCursor, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;

    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('cursor', cursor);

      const response = await fetch(`${bffPaths.listings.search}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await response.json()) as SearchApiResponse;

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Request failed');
      }

      const newItems = json.data ?? [];
      setListings((prev) => [...prev, ...newItems]);
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

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">{t('featured.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ListingGrid listings={listings} />

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loading ? (
          <CarouselSkeleton />
        ) : null}
        {error ? (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        ) : null}
        {!hasMore && listings.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
