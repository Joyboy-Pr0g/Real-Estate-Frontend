import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { HomePropertyTypeSection } from '@/features/home/types/home-listings';

export const homeListingsService = {
  async getByPropertyType(limitPerType = 10): Promise<HomePropertyTypeSection[]> {
    const res = await serverFetch<HomePropertyTypeSection[]>(
      backendPaths.propertyTypes.publicHomeListings,
      {
        cacheProfile: 'none',
        searchParams: { limit_per_type: limitPerType },
      },
    );
    return res.data ?? [];
  },
};
