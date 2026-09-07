import type { MetadataRoute } from 'next';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { listingService } from '@/features/listings/services/listing-service';
import { publicOfficeService } from '@/features/office/services/public-office-service';
import { getOfficePublicPath } from '@/features/office/lib/office-url';
import { getSiteUrl } from '@/lib/seo/metadata';
import { FALLBACK_WEBSITE_SETTINGS } from '@/lib/website-settings/defaults';
import { LEGAL_PAGE_PATHS } from '@/lib/seo/indexing';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}> = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/listings', priority: 0.9, changeFrequency: 'daily' },
  { path: '/listings/map', priority: 0.85, changeFrequency: 'daily' },
  { path: '/offices', priority: 0.85, changeFrequency: 'weekly' },
  ...LEGAL_PAGE_PATHS.map((path) => ({
    path,
    priority: path === '/about' || path === '/contact' ? 0.6 : 0.4,
    changeFrequency: 'monthly' as ChangeFrequency,
  })),
];

async function resolveSiteUrl(): Promise<string> {
  try {
    const settings = await getWebsiteSettingsServer();
    return getSiteUrl(settings);
  } catch {
    return getSiteUrl(FALLBACK_WEBSITE_SETTINGS);
  }
}

function toAbsoluteUrl(siteUrl: string, path: string): string {
  if (!path || path === '/') return siteUrl;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function toLastModified(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function getAllListingEntries(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const page = await listingService.search({ limit: 100, cursor });
      for (const listing of page.items) {
        if (!listing.slug) continue;
        entries.push({
          url: toAbsoluteUrl(siteUrl, `/listings/${listing.slug}`),
          lastModified: toLastModified(listing.published_at || listing.created_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
      hasMore = page.has_more;
      cursor = page.next_cursor ?? undefined;
      if (!cursor) break;
    }
  } catch {
    // Backend unavailable — static routes still included.
  }

  return entries;
}

async function getOfficeEntries(siteUrl: string, indexOfficeProfiles: boolean): Promise<MetadataRoute.Sitemap> {
  if (!indexOfficeProfiles) return [];

  const entries: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const page = await publicOfficeService.search({ limit: 100, cursor });
      for (const office of page.items) {
        if (!office.name) continue;
        entries.push({
          url: toAbsoluteUrl(siteUrl, getOfficePublicPath(office.name)),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.65,
        });
      }
      hasMore = page.has_more;
      cursor = page.next_cursor ?? undefined;
      if (!cursor) break;
    }
  } catch {
    return [];
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getWebsiteSettingsServer();
  const siteUrl = await resolveSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: toAbsoluteUrl(siteUrl, route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [listingEntries, officeEntries] = await Promise.all([
    getAllListingEntries(siteUrl),
    getOfficeEntries(siteUrl, settings.index_office_profiles),
  ]);

  return [...staticEntries, ...listingEntries, ...officeEntries];
}
