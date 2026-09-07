import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';

export async function updateAdminWebsiteSettings(data: FormData): Promise<WebsiteSettings> {
  const res = await clientFetch<WebsiteSettings>(bffPaths.websiteSettings.admin, {
    method: 'PATCH',
    body: data,
  });
  return res.data!;
}
