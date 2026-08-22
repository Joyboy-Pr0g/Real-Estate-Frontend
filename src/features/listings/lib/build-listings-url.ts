import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import {
  appendSpecToSearchParams,
  clearSpecFromSearchParams,
} from '@/features/listings/lib/spec-url';
import { ListingSpecFilters } from '@/features/listings/types/spec-filters';

export interface ListingsUrlFilters {
  propertyTypeSlug?: string;
  propertySubtypeSlug?: string;
  transactionTypeSlug?: string;
  cityPcode?: string;
  neighborhoodPcode?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
  spec?: ListingSpecFilters;
}

export function buildListingsUrl(filters: ListingsUrlFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.propertyTypeSlug) {
    params.set(LISTING_URL_PARAMS.propertyType, filters.propertyTypeSlug);
  }
  if (filters.propertySubtypeSlug) {
    params.set(LISTING_URL_PARAMS.propertySubtype, filters.propertySubtypeSlug);
  }
  if (filters.transactionTypeSlug) {
    params.set(LISTING_URL_PARAMS.transactionType, filters.transactionTypeSlug);
  }
  if (filters.cityPcode) {
    params.set(LISTING_URL_PARAMS.city, filters.cityPcode);
  }
  if (filters.neighborhoodPcode) {
    params.set(LISTING_URL_PARAMS.neighborhood, filters.neighborhoodPcode);
  }
  if (filters.minPrice) {
    params.set(LISTING_URL_PARAMS.minPrice, filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set(LISTING_URL_PARAMS.maxPrice, filters.maxPrice);
  }
  if (filters.sort) {
    params.set(LISTING_URL_PARAMS.sort, filters.sort);
  }
  if (filters.cursor) {
    params.set(LISTING_URL_PARAMS.cursor, filters.cursor);
  }
  if (filters.limit) {
    params.set(LISTING_URL_PARAMS.limit, String(filters.limit));
  }
  if (filters.spec) {
    appendSpecToSearchParams(params, filters.spec);
  }

  const query = params.toString();
  return query ? `/listings?${query}` : '/listings';
}

export function buildListingsHref(
  current: URLSearchParams,
  updates: Record<string, string | null>,
  options?: { clearSpec?: boolean },
): string {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '' || value === 'undefined') params.delete(key);
    else params.set(key, value);
  }

  if (options?.clearSpec) {
    clearSpecFromSearchParams(params);
  }

  params.delete(LISTING_URL_PARAMS.cursor);

  const query = params.toString();
  return query ? `/listings?${query}` : '/listings';
}

export function stripSpecParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  clearSpecFromSearchParams(next);
  return next;
}
