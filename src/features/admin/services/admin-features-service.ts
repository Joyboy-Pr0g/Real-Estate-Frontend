import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import {
  AdminMainFeature,
  AdminSubFeature,
  SubFeaturesSearchParams,
} from '@/features/admin/types/features';

async function adminFetch<T>(path: string, searchParams?: Record<string, string | undefined>): Promise<T[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await serverFetch<T[]>(path, {
    token,
    cacheProfile: 'none',
    searchParams,
  });

  return response.data ?? [];
}

export async function getAdminMainFeatures(): Promise<AdminMainFeature[]> {
  return adminFetch<AdminMainFeature>(backendPaths.features.admin);
}

export async function getAdminSubFeatures(
  params: SubFeaturesSearchParams = {},
): Promise<AdminSubFeature[]> {
  return adminFetch<AdminSubFeature>(backendPaths.features.adminSub, {
    main_feature_id: params.main_feature_id,
  });
}
