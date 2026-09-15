import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { normalizeSearchQueryKey } from '@/features/listings/lib/listings-client-navigation';

export function listingSearchParamsToQueryKey(params: ListingSearchUrlParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }
    searchParams.set(key, value);
  }

  return normalizeSearchQueryKey(searchParams);
}
