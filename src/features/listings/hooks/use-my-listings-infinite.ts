'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { MyListingSummary } from '@/features/listings/types/listing';
import { bffPaths } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

const MY_LISTINGS_FILTER_KEYS = [
  'status',
  'search',
  'property_type_id',
  'property_subtype_id',
  'transaction_type_id',
  'city_id',
  'neighborhood_id',
  'office_id',
] as const;

interface MyListingsPageResult {
  listings: MyListingSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface MyListingsApiResponse {
  success: boolean;
  data: MyListingSummary[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

interface UseMyListingsInfiniteOptions {
  initialItems: MyListingSummary[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

export function buildMyListingsFilterKey(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();
  for (const key of MY_LISTINGS_FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  return params.toString();
}

async function fetchMyListingsPage(
  filterKey: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<MyListingsPageResult> {
  const params = new URLSearchParams(filterKey);
  params.delete('cursor');
  if (cursor) params.set('cursor', cursor);

  const response = await fetch(`${bffPaths.listings.myListings}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as MyListingsApiResponse;

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? 'Request failed');
  }

  return {
    listings: json.data ?? [],
    nextCursor: json.next_cursor ?? null,
    hasMore: json.has_more ?? false,
  };
}

export function useMyListingsInfinite({
  initialItems,
  initialCursor,
  initialHasMore,
}: UseMyListingsInfiniteOptions) {
  const searchParams = useSearchParams();
  const filterKey = useMemo(() => buildMyListingsFilterKey(searchParams), [searchParams]);
  const ssrFilterKeyRef = useRef(filterKey);

  const initialData =
    filterKey === ssrFilterKeyRef.current
      ? {
          pages: [
            {
              listings: initialItems,
              nextCursor: initialCursor,
              hasMore: initialHasMore,
            },
          ],
          pageParams: [undefined] as Array<string | undefined>,
        }
      : undefined;

  const query = useInfiniteQuery({
    queryKey: queryKeys.listings.my(filterKey),
    queryFn: ({ pageParam, signal }) => fetchMyListingsPage(filterKey, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    placeholderData: keepPreviousData,
  });

  const items = query.data?.pages.flatMap((page) => page.listings) ?? [];
  const hasMore = query.data?.pages.at(-1)?.hasMore ?? false;
  const filterLoading = query.isFetching && !query.isFetchingNextPage;
  const loadMoreLoading = query.isFetchingNextPage;

  return {
    items,
    hasMore,
    filterLoading,
    filterError: query.isError,
    loadMoreLoading,
    loadMoreError: query.isFetchNextPageError,
    loadMore: query.fetchNextPage,
    retryFilter: query.refetch,
    filterKey,
  };
}
