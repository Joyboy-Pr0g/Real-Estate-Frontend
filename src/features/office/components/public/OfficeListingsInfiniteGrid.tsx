'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListingGrid } from '@/features/listings/components/ListingGrid';
import { mergeUniqueListings } from '@/features/listings/lib/merge-unique-listings';
import { PublicListing } from '@/features/listings/types/listing';
import { bffPaths } from '@/lib/api/endpoints';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CarouselSkeleton } from '@/features/shared/components/LoadingSkeletons';

interface OfficeListingsInfiniteGridProps {
  officeName: string;
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

interface ListingsApiResponse {
  success: boolean;
  data: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

export function OfficeListingsInfiniteGrid({
  officeName,
  initialListings,
  initialCursor,
  initialHasMore,
}: OfficeListingsInfiniteGridProps) {
  const { t } = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const [listings, setListings] = useState(initialListings);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({ cursor, limit: '8' });
      const response = await fetch(
        `${bffPaths.offices.publicListingsByName(officeName)}?${params.toString()}`,
        { headers: { Accept: 'application/json' } },
      );
      const json = (await response.json()) as ListingsApiResponse;

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Request failed');
      }

      setListings((prev) => mergeUniqueListings(prev, json.data ?? []));
      setCursor(json.next_cursor ?? null);
      setHasMore(json.has_more ?? false);
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, hasMore, loading, officeName]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '240px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore]);

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">{t('offices.detail.noListings')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ListingGrid listings={listings} />

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
        {!hasMore && listings.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
