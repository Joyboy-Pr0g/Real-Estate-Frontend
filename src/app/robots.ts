import type { MetadataRoute } from 'next';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { getSiteUrl, shouldAllowIndexing } from '@/lib/seo/metadata';
import { FALLBACK_WEBSITE_SETTINGS } from '@/lib/website-settings/defaults';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let settings = FALLBACK_WEBSITE_SETTINGS;
  try {
    settings = await getWebsiteSettingsServer();
  } catch {
    // Use fallback settings.
  }

  const siteUrl = getSiteUrl(settings);
  const allowIndexing = shouldAllowIndexing(settings);

  const disallow = ['/admin', '/dashboard', '/login', '/register', '/forgot-password', '/verify-email', '/api'];

  if (!settings.index_listing_search_pages) {
    disallow.push('/listings?');
  }

  return {
    rules: {
      userAgent: '*',
      allow: allowIndexing ? '/' : undefined,
      disallow: allowIndexing ? disallow : '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
