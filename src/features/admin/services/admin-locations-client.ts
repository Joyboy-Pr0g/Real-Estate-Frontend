'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  AdminCity,
  AdminLocationsPage,
  AdminNeighborhood,
  CitiesSearchParams,
  NeighborhoodPayload,
  NeighborhoodsSearchParams,
  NeighborhoodUpdatePayload,
} from '@/features/admin/types/locations';

async function fetchLocationsPage<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<AdminLocationsPage<T>> {
  const res = await clientFetch<T[]>(path, { searchParams: params });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}

export async function loadMoreAdminCities(
  params: CitiesSearchParams & { cursor: string },
): Promise<AdminLocationsPage<AdminCity>> {
  return fetchLocationsPage<AdminCity>(bffPaths.admin.cities, {
    search: params.search,
    cursor: params.cursor,
    limit: params.limit ?? 50,
  });
}

export async function loadMoreAdminNeighborhoods(
  params: NeighborhoodsSearchParams & { cursor: string },
): Promise<AdminLocationsPage<AdminNeighborhood>> {
  return fetchLocationsPage<AdminNeighborhood>(bffPaths.admin.neighborhoods, {
    search: params.search,
    city_id: params.city_id,
    cursor: params.cursor,
    limit: params.limit ?? 50,
  });
}

export async function createCity(formData: FormData): Promise<AdminCity> {
  const res = await clientFetch<AdminCity>(bffPaths.admin.cities, {
    method: 'POST',
    body: formData,
  });
  return res.data!;
}

export async function updateCity(id: string, formData: FormData): Promise<void> {
  await clientFetch(bffPaths.admin.cityById(id), { method: 'PUT', body: formData });
}

export async function deleteCity(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.cityById(id), { method: 'DELETE' });
}

export async function createNeighborhood(payload: NeighborhoodPayload): Promise<AdminNeighborhood> {
  const res = await clientFetch<AdminNeighborhood>(bffPaths.admin.neighborhoods, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updateNeighborhood(
  id: string,
  payload: NeighborhoodUpdatePayload,
): Promise<void> {
  await clientFetch(bffPaths.admin.neighborhoodById(id), {
    method: 'PUT',
    body: { ...payload },
  });
}

export async function deleteNeighborhood(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.neighborhoodById(id), { method: 'DELETE' });
}
