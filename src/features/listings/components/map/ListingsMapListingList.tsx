'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapListingCard } from '@/features/listings/components/map/MapListingCard';
import { loadMoreMapListings } from '@/features/listings/services/listing-search-client';
import { ListingSearchQuery } from '@/features/listings/schemas/search-schema';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ListingsMapListingListProps {
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
  resolvedFilters: ListingSearchQuery;
  queryKey: string;
}

export function ListingsMapListingList({
  initialListings,
  initialCursor,
  initialHasMore,
  resolvedFilters,
  queryKey,
}: ListingsMapListingListProps) {
  const { t } = useLocale();
  const [listings, setListings] = useState(initialListings);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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
      const result = await loadMoreMapListings(resolvedFilters, cursor);
      setListings((prev) => [...prev, ...result.items]);
      setCursor(result.next_cursor);
      setHasMore(result.has_more);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, resolvedFilters]);

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
        <p className="text-sm text-gray-500">{t('featured.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <MapListingCard key={listing.id} listing={listing} />
      ))}

      {hasMore ? (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            disabled={loading}
            onClick={() => void loadMore()}
          >
            {loading ? t('search.loading') : t('map.loadMoreListings')}
          </Button>
          {error ? (
            <button
              type="button"
              onClick={() => void loadMore()}
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
