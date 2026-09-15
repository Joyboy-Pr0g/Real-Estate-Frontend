'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useListingsSearchParams } from '@/features/listings/hooks/use-listings-search-params';
import { normalizeSearchQueryKey } from '@/features/listings/lib/listings-client-navigation';
import { fetchListingsSearchPage } from '@/features/listings/services/fetch-listings-search-client';
import { PublicListing } from '@/features/listings/types/listing';
import { queryKeys } from '@/lib/query/keys';

interface UseMarketplaceListingsInfiniteOptions {
  initialListings: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialSearchKey: string;
  defaultLimit?: number;
  enabled?: boolean;
}

function buildSearchParams(searchParams: URLSearchParams, defaultLimit?: number): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  if (defaultLimit && !params.has('limit')) {
    params.set('limit', String(defaultLimit));
  }
  return params;
}

export function useMarketplaceListingsInfinite({
  initialListings,
  initialCursor,
  initialHasMore,
  initialSearchKey,
  defaultLimit,
  enabled = true,
}: UseMarketplaceListingsInfiniteOptions) {
  const searchParams = useListingsSearchParams();
  const params = useMemo(
    () => buildSearchParams(searchParams, defaultLimit),
    [searchParams, defaultLimit],
  );
  const queryKey = normalizeSearchQueryKey(params);
  const ssrQueryKeyRef = useRef(initialSearchKey);
  const isInitialQuery = queryKey === ssrQueryKeyRef.current;

  const initialData = isInitialQuery
    ? {
        pages: [
          {
            listings: initialListings,
            nextCursor: initialCursor,
            hasMore: initialHasMore,
          },
        ],
        pageParams: [undefined] as Array<string | undefined>,
      }
    : undefined;

  const query = useInfiniteQuery({
    queryKey: queryKeys.listings.search(queryKey),
    enabled,
    queryFn: ({ pageParam, signal }) =>
      fetchListingsSearchPage(params, {
        cursor: pageParam,
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: isInitialQuery ? Infinity : 30_000,
    refetchOnMount: isInitialQuery ? false : true,
  });

  const listings = query.data?.pages.flatMap((page) => page.listings) ?? [];
  const hasMore = query.data?.pages.at(-1)?.hasMore ?? false;
  const filterLoading = query.isFetching && !query.isFetchingNextPage;
  const loadMoreLoading = query.isFetchingNextPage;

  return {
    listings,
    hasMore,
    filterLoading,
    filterError: query.isError,
    loadMoreLoading,
    loadMoreError: query.isFetchNextPageError,
    loadMore: query.fetchNextPage,
    retryFilter: query.refetch,
    queryKey,
  };
}
