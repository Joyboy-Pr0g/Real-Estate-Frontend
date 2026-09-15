'use client';

import { useQuery } from '@tanstack/react-query';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export function useFilterPropertySubtypes(propertyTypeId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.catalog.propertySubtypes(propertyTypeId ?? ''),
    enabled: Boolean(propertyTypeId),
    queryFn: async ({ signal }) => {
      const res = await clientFetch<PublicPropertySubtype[]>(
        bffPaths.propertySubtypes.byPropertyType(propertyTypeId!),
        { signal },
      );
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    propertySubtypes: propertyTypeId ? (query.data ?? []) : [],
    loadingSubtypes: Boolean(propertyTypeId) && query.isFetching && query.data === undefined,
  };
}
