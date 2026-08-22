import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { PublicMainFeature } from '../types/feature';

export const featureService = {
  async getMainFeatures(): Promise<PublicMainFeature[]> {
    const res = await serverFetch<PublicMainFeature[]>(backendPaths.features.public, {
      cacheProfile: 'long',
    });
    return res.data ?? [];
  },
};
