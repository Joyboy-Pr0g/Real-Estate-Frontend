import { PublicListing } from '@/features/listings/types/listing';
import { bffPaths } from '@/lib/api/endpoints';

export interface ListingsSearchPageResult {
  listings: PublicListing[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface SearchApiResponse {
  success: boolean;
  data: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

export async function fetchListingsSearchPage(
  searchParams: URLSearchParams,
  options?: { cursor?: string; signal?: AbortSignal },
): Promise<ListingsSearchPageResult> {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('cursor');
  if (options?.cursor) params.set('cursor', options.cursor);

  const response = await fetch(`${bffPaths.listings.search}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal: options?.signal,
  });
  const json = (await response.json()) as SearchApiResponse;

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? 'Request failed');
  }

  return {
    listings: json.data ?? [],
    nextCursor: json.next_cursor ?? null,
    hasMore: json.has_more ?? false,
  };
}
