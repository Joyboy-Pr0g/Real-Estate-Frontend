const EXCLUDED_LISTING_FILTER_PARAMS = new Set(['cursor', 'limit']);

export function serializeListingFiltersFromSearchParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const filters: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (EXCLUDED_LISTING_FILTER_PARAMS.has(key) || !value.trim()) {
      continue;
    }
    filters[key] = value;
  }

  return filters;
}

export function buildListingsUrlFromSavedFilters(filters: Record<string, string>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  }

  const query = params.toString();
  return query ? `/listings?${query}` : '/listings';
}

export function buildListingsLoginRedirectUrl(filters: Record<string, string>): string {
  const returnPath = buildListingsUrlFromSavedFilters(filters);
  return `/login?redirect=${encodeURIComponent(returnPath)}`;
}

export function buildListingsLoginRedirectFromSearchParams(searchParams: URLSearchParams): string {
  return buildListingsLoginRedirectUrl(serializeListingFiltersFromSearchParams(searchParams));
}
