'use client';

import { Button } from '@/components/ui/button';
import { MapListingCard } from '@/features/listings/components/map/MapListingCard';
import { PublicListing } from '@/features/listings/types/listing';
import { ListingGridSkeleton } from '@/features/shared/components/LoadingSkeletons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingsMapListingListProps {
  listings: PublicListing[];
  hasMore: boolean;
  filterLoading: boolean;
  filterError: boolean;
  loadMoreLoading: boolean;
  loadMoreError: boolean;
  onLoadMore: () => void;
  onRetryFilter: () => void;
}

export function ListingsMapListingList({
  listings,
  hasMore,
  filterLoading,
  filterError,
  loadMoreLoading,
  loadMoreError,
  onLoadMore,
  onRetryFilter,
}: ListingsMapListingListProps) {
  const { t } = useLocale();

  if (filterLoading && listings.length === 0) {
    return <ListingGridSkeleton count={4} />;
  }

  if (filterError && listings.length === 0) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-8 text-center">
        <p className="text-sm text-secondary-dark">{t('featured.error')}</p>
        <button
          type="button"
          onClick={onRetryFilter}
          className="mt-2 text-xs font-medium text-secondary hover:underline"
        >
          {t('filters.loadMoreError')}
        </button>
      </div>
    );
  }

  if (!filterLoading && listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
        <p className="text-sm text-gray-500">{t('featured.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={cn('space-y-3 transition-opacity duration-200', filterLoading && 'opacity-45')}>
        {listings.map((listing) => (
          <MapListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {filterError ? (
        <button
          type="button"
          onClick={onRetryFilter}
          className="w-full text-center text-xs font-medium text-secondary hover:underline"
        >
          {t('filters.loadMoreError')}
        </button>
      ) : null}

      {hasMore ? (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            disabled={loadMoreLoading || filterLoading}
            onClick={onLoadMore}
          >
            {loadMoreLoading ? t('search.loading') : t('map.loadMoreListings')}
          </Button>
          {loadMoreError ? (
            <button
              type="button"
              onClick={onLoadMore}
              className="mt-2 w-full text-center text-xs font-medium text-secondary hover:underline"
            >
              {t('filters.loadMoreError')}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400">{t('filters.endOfResults')}</p>
      )}
    </div>
  );
}
