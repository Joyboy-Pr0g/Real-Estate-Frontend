import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import {
  AdminCity,
  AdminLocationsPage,
  AdminNeighborhood,
  CitiesSearchParams,
  NeighborhoodsSearchParams,
  PublicCityOption,
} from '@/features/admin/types/locations';

const DEFAULT_LIMIT = 50;

async function fetchAdminPage<T>(
  path: string,
  searchParams: Record<string, string | number | undefined>,
): Promise<AdminLocationsPage<T>> {
  const token = await getAuthToken();
  if (!token) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const response = await serverFetch<T[]>(path, {
    token,
    cacheProfile: 'none',
    searchParams,
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function getAdminCities(
  params: CitiesSearchParams = {},
): Promise<AdminLocationsPage<AdminCity>> {
  return fetchAdminPage<AdminCity>(backendPaths.cities.admin, {
    search: params.search,
    cursor: params.cursor,
    limit: params.limit ?? DEFAULT_LIMIT,
  });
}

export async function getAdminNeighborhoods(
  params: NeighborhoodsSearchParams = {},
): Promise<AdminLocationsPage<AdminNeighborhood>> {
  return fetchAdminPage<AdminNeighborhood>(backendPaths.neighborhoods.admin, {
    search: params.search,
    city_id: params.city_id,
    cursor: params.cursor,
    limit: params.limit ?? DEFAULT_LIMIT,
  });
}

export async function getPublicCitiesForAdmin(): Promise<PublicCityOption[]> {
  const response = await serverFetch<PublicCityOption[]>(backendPaths.cities.public, {
    cacheProfile: 'short',
  });
  return response.data ?? [];
}
