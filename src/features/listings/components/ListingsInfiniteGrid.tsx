'use client';

import { useEffect, useRef } from 'react';
import { ListingGrid } from '@/features/listings/components/ListingGrid';
import { useMarketplaceListingsInfinite } from '@/features/listings/hooks/use-marketplace-listings-infinite';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CarouselSkeleton, ListingGridSkeleton } from '@/features/shared/components/LoadingSkeletons';
import { cn } from '@/lib/utils/cn';

interface ListingsInfiniteGridProps {
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

export function ListingsInfiniteGrid({
  initialListings,
  initialCursor,
  initialHasMore,
}: ListingsInfiniteGridProps) {
  const { t } = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    listings,
    hasMore,
    filterLoading,
    filterError,
    loadMoreLoading,
    loadMoreError,
    loadMore,
    retryFilter,
    queryKey,
  } = useMarketplaceListingsInfinite({
    initialListings,
    initialCursor,
    initialHasMore,
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || filterLoading || loadMoreLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '240px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, queryKey, filterLoading, loadMoreLoading]);

  if (filterLoading && listings.length === 0) {
    return <ListingGridSkeleton count={8} />;
  }

  if (filterError && listings.length === 0) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/80 px-6 py-12 text-center">
        <p className="text-secondary-dark font-medium">{t('featured.error')}</p>
        <button
          type="button"
          onClick={() => void retryFilter()}
          className="mt-3 text-sm font-medium text-secondary hover:underline"
        >
          {t('filters.loadMoreError')}
        </button>
      </div>
    );
  }

  if (!filterLoading && listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">{t('featured.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div
          className={cn(
            'transition-opacity duration-200',
            filterLoading && 'pointer-events-none opacity-45',
          )}
        >
          <ListingGrid listings={listings} />
        </div>

        {filterLoading ? (
          <div className="absolute inset-0 flex items-start justify-center pt-8">
            <ListingGridSkeleton count={4} />
          </div>
        ) : null}
      </div>

      {filterError ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => void retryFilter()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        </div>
      ) : null}

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loadMoreLoading ? <CarouselSkeleton /> : null}
        {loadMoreError ? (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        ) : null}
        {!hasMore && listings.length > 0 && !filterLoading ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
