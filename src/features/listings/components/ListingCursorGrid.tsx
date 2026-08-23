'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListingGrid } from '@/features/listings/components/ListingGrid';
import { RemovableListingGrid } from '@/features/listings/components/RemovableListingGrid';
import { unsaveListing, removeViewHistoryEntry } from '@/features/listings/services/listing-client';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';
import { CarouselSkeleton } from '@/features/shared/components/LoadingSkeletons';
import type { TranslationKey } from '@/lib/i18n/ar';

interface ListingCursorGridProps {
  initialItems: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
  fetchPath: string;
  emptyMessageKey: TranslationKey;
  removeAction?: 'unsave' | 'remove-view';
}

const REMOVE_ACTIONS = {
  unsave: unsaveListing,
  'remove-view': removeViewHistoryEntry,
};

interface CursorApiResponse {
  success: boolean;
  data: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

export function ListingCursorGrid({
  initialItems,
  initialCursor,
  initialHasMore,
  fetchPath,
  emptyMessageKey,
  removeAction,
}: ListingCursorGridProps) {
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
      const response = await fetch(`${fetchPath}?${params.toString()}`, {
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
  }, [cursor, hasMore, loading, fetchPath]);

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
        <p className="text-gray-500">{t(emptyMessageKey)}</p>
      </div>
    );
  }

  const handleRemove = removeAction
    ? async (listingId: string) => {
        await REMOVE_ACTIONS[removeAction](listingId);
        setItems((prev) => prev.filter((item) => item.id !== listingId));
      }
    : undefined;

  return (
    <div className="space-y-8">
      {handleRemove ? (
        <RemovableListingGrid
          listings={items}
          onRemove={handleRemove}
          savedIds={removeAction === 'unsave' ? items.map((item) => item.id) : undefined}
        />
      ) : (
        <ListingGrid listings={items} />
      )}

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
        {!hasMore && items.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
