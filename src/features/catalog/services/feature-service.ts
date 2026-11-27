import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { PublicMainFeature } from '../types/feature';
import { CACHE_TAGS } from '@/lib/cache/tags';

export const featureService = {
  async getMainFeatures(): Promise<PublicMainFeature[]> {
    const res = await serverFetch<PublicMainFeature[]>(backendPaths.features.public, {
      cacheProfile: 'long',
      tags: [CACHE_TAGS.publicFeatures],
    });
    return res.data ?? [];
  },
};
