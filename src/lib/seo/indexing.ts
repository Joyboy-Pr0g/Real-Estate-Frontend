import { getOfficePublicPath } from '@/features/office/lib/office-url';
import type { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';

const LISTINGS_IGNORED_PARAMS = new Set(['cursor', 'limit', 'sort']);

export function hasSearchFilters(params: ListingSearchUrlParams): boolean {
  return Object.entries(params).some(([key, value]) => {
    if (LISTINGS_IGNORED_PARAMS.has(key)) return false;
    if (value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

export function getListingsCanonicalPath(_params?: ListingSearchUrlParams): string {
  return '/listings';
}

export function getListingsMapCanonicalPath(): string {
  return '/listings/map';
}

export function getListingCanonicalPath(slug: string): string {
  return `/listings/${slug}`;
}

export function getOfficeCanonicalPath(name: string): string {
  return getOfficePublicPath(name);
}

export function getOfficesCanonicalPath(): string {
  return '/offices';
}

export const LEGAL_PAGE_PATHS = [
  '/privacy',
  '/terms',
  '/cookies',
  '/messaging-policy',
  '/listing-policy',
  '/data-protection',
  '/verification',
  '/about',
  '/contact',
] as const;
