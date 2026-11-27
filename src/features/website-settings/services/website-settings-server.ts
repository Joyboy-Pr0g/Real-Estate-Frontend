import { cache } from 'react';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import {
  FALLBACK_WEBSITE_SETTINGS,
  withWebsiteSettingsDefaults,
} from '@/lib/website-settings/defaults';
import { CACHE_TAGS } from '@/lib/cache/tags';

export const getWebsiteSettingsServer = cache(async (): Promise<WebsiteSettings> => {
  try {
    const res = await fetchBackend<WebsiteSettings>(backendPaths.websiteSettings.public, {
      cacheProfile: 'static',
      tags: [CACHE_TAGS.websiteSettings],
    });
    if (!res.data) return FALLBACK_WEBSITE_SETTINGS;
    return withWebsiteSettingsDefaults(res.data);
  } catch {
    return FALLBACK_WEBSITE_SETTINGS;
  }
});
