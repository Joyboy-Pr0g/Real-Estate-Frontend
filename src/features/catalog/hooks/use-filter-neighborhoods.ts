'use client';

import { useQuery } from '@tanstack/react-query';
import { normalizePublicNeighborhoods } from '@/features/catalog/lib/normalize-neighborhood';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export function useFilterNeighborhoods(cityId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.catalog.neighborhoods(cityId ?? ''),
    enabled: Boolean(cityId),
    queryFn: async ({ signal }) => {
      const res = await clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
        params: { city_id: cityId! },
        signal,
      });
      return normalizePublicNeighborhoods(
        (res.data ?? []) as Array<PublicNeighborhood & Record<string, unknown>>,
      );
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    neighborhoods: cityId ? (query.data ?? []) : [],
    loadingNeighborhoods: Boolean(cityId) && query.isFetching && query.data === undefined,
  };
}
