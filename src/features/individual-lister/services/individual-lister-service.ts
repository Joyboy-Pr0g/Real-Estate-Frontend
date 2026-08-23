import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { IndividualListerProfile } from '@/features/individual-lister/types/individual-lister';

export async function getMyIndividualListerProfile(): Promise<IndividualListerProfile | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await serverFetch<IndividualListerProfile | null>(backendPaths.individualListers.my, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
