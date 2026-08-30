'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  CreateFavoriteFilterPayload,
  FavoriteFilterItem,
  FavoriteFiltersPage,
} from '@/features/listings/types/favorite-filter';

export async function createFavoriteFilter(
  payload: CreateFavoriteFilterPayload,
): Promise<FavoriteFilterItem> {
  const res = await clientFetch<FavoriteFilterItem>(bffPaths.listings.favoriteFilters, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function deleteFavoriteFilter(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.favoriteFilterById(id), { method: 'DELETE' });
}

export async function loadMoreFavoriteFilters(
  params: Record<string, string>,
): Promise<FavoriteFiltersPage> {
  const res = await clientFetch<FavoriteFilterItem[]>(bffPaths.listings.favoriteFilters, {
    searchParams: params,
  });

  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}
