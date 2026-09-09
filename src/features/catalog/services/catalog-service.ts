import { cache } from 'react';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import {
  PublicCatalog,
  PublicCity,
  PublicPropertyType,
  PublicTransactionType,
} from '../types/catalog';
import { PublicNeighborhood } from '../types/neighborhood';
import { normalizePublicNeighborhoods } from '../lib/normalize-neighborhood';
import { PublicPropertySubtype } from '../types/property-subtype';

export const catalogService = {
  async getCities(): Promise<PublicCity[]> {
    const res = await serverFetch<PublicCity[]>(backendPaths.cities.public, {
      cacheProfile: 'static',
      tags: ['public-catalog'],
    });
    return res.data ?? [];
  },

  async getPropertyTypes(): Promise<PublicPropertyType[]> {
    const res = await serverFetch<PublicPropertyType[]>(backendPaths.propertyTypes.public, {
      cacheProfile: 'static',
      tags: ['public-catalog'],
    });
    return res.data ?? [];
  },

  async getTransactionTypes(): Promise<PublicTransactionType[]> {
    const res = await serverFetch<PublicTransactionType[]>(backendPaths.transactionTypes.public, {
      cacheProfile: 'static',
      tags: ['public-catalog'],
    });
    return res.data ?? [];
  },

  async getNeighborhoodsByCity(cityId: string): Promise<PublicNeighborhood[]> {
    const res = await serverFetch<PublicNeighborhood[]>(backendPaths.neighborhoods.public, {
      cacheProfile: 'static',
      tags: ['public-catalog'],
      searchParams: { city_id: cityId, limit: 100 },
    });
    return normalizePublicNeighborhoods((res.data ?? []) as Array<PublicNeighborhood & Record<string, unknown>>);
  },

  async getPropertySubtypes(propertyTypeId: string): Promise<PublicPropertySubtype[]> {
    const res = await serverFetch<PublicPropertySubtype[]>(
      backendPaths.propertySubtypes.byPropertyType(propertyTypeId),
      { cacheProfile: 'static', tags: ['public-catalog'] },
    );
    return res.data ?? [];
  },

  async getPropertySubtypeBySlug(slug: string): Promise<PublicPropertySubtype | null> {
    try {
      const res = await serverFetch<PublicPropertySubtype>(backendPaths.propertySubtypes.bySlug(slug), {
        cacheProfile: 'static',
        tags: ['public-catalog'],
      });
      return res.data ?? null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  getPublicCatalog: cache(async (): Promise<PublicCatalog> => {
    const [cities, propertyTypes, transactionTypes] = await Promise.all([
      catalogService.getCities(),
      catalogService.getPropertyTypes(),
      catalogService.getTransactionTypes(),
    ]);
    return { cities, propertyTypes, transactionTypes };
  }),
};
