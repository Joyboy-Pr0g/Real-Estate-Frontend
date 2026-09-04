import { cache } from 'react';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { HomePropertyTypeSection } from '@/features/home/types/home-listings';
import { HOME_LISTINGS_PER_TYPE } from '@/features/home/constants/home-listings';

async function fetchHomeListingsByPropertyType(
  limitPerType = HOME_LISTINGS_PER_TYPE,
): Promise<HomePropertyTypeSection[]> {
  const res = await serverFetch<HomePropertyTypeSection[]>(
    backendPaths.propertyTypes.publicHomeListings,
    {
      cacheProfile: 'medium',
      searchParams: { limit_per_type: limitPerType },
    },
  );
  return res.data ?? [];
}

export const homeListingsService = {
  getByPropertyType: cache(fetchHomeListingsByPropertyType),
};
