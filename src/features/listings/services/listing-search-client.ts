import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { appendSpecToSearchParams } from '@/features/listings/lib/spec-url';
import { ListingSearchQuery } from '@/features/listings/schemas/search-schema';
import { PublicListing } from '@/features/listings/types/listing';

interface SearchApiResponse {
  success: boolean;
  data: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

function toSearchParams(filters: ListingSearchQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.limit) params.limit = filters.limit;
  if (filters.sort) params.sort = filters.sort;
  if (filters.cursor) params.cursor = filters.cursor;
  if (filters.city_id) params.city_id = filters.city_id;
  if (filters.neighborhood_id) params.neighborhood_id = filters.neighborhood_id;
  if (filters.property_type_id) params.property_type_id = filters.property_type_id;
  if (filters.property_subtype_id) params.property_subtype_id = filters.property_subtype_id;
  if (filters.transaction_type_id) params.transaction_type_id = filters.transaction_type_id;
  if (filters.office_id) params.office_id = filters.office_id;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;

  if (filters.spec) {
    const specParams = new URLSearchParams();
    appendSpecToSearchParams(specParams, filters.spec);
    for (const [key, value] of specParams.entries()) {
      params[key] = value;
    }
  }

  return params;
}

export async function loadMoreMapListings(
  filters: ListingSearchQuery,
  cursor: string,
): Promise<{ items: PublicListing[]; next_cursor: string | null; has_more: boolean }> {
  const response = await clientFetch<PublicListing[]>(bffPaths.listings.search, {
    searchParams: toSearchParams({ ...filters, cursor }),
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}
