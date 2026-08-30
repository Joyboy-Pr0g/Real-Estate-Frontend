import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { FavoriteFilterItem, FavoriteFiltersPage } from '@/features/listings/types/favorite-filter';

export async function getMyFavoriteFilters(params: Record<string, string> = {}): Promise<FavoriteFiltersPage> {
  const token = await getAuthToken();
  if (!token) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const response = await serverFetch<FavoriteFilterItem[]>(backendPaths.listings.favoriteFilters, {
    token,
    searchParams: params,
    cacheProfile: 'none',
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}
