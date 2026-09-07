import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';

export async function getAdminWebsiteSettingsServer(): Promise<WebsiteSettings> {
  const token = await getAuthToken();
  const res = await serverFetch<WebsiteSettings>(backendPaths.websiteSettings.admin, {
    token,
    cacheProfile: 'none',
  });
  return res.data!;
}
