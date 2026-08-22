import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { PublicCity, PublicPropertyType, PublicTransactionType } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';

async function fetchLookup<T>(path: string): Promise<T | null> {
  try {
    const res = await serverFetch<T>(path, { cacheProfile: 'long' });
    return res.data ?? null;
  } catch {
    return null;
  }
}

export const catalogLookupService = {
  getPropertyTypeBySlug(slug: string) {
    return fetchLookup<PublicPropertyType>(backendPaths.propertyTypes.bySlug(slug));
  },

  getTransactionTypeBySlug(slug: string) {
    return fetchLookup<PublicTransactionType>(backendPaths.transactionTypes.bySlug(slug));
  },

  getPropertySubtypeBySlug(slug: string) {
    return fetchLookup<PublicPropertySubtype>(backendPaths.propertySubtypes.bySlug(slug));
  },

  getCityByPcode(pcode: string) {
    return fetchLookup<PublicCity>(backendPaths.cities.byPcode(pcode));
  },

  getNeighborhoodByPcode(neighbPcode: string) {
    return fetchLookup<PublicNeighborhood>(backendPaths.neighborhoods.byPcode(neighbPcode));
  },
};
