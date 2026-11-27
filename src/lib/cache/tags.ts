import 'server-only';
import { createHash } from 'node:crypto';

export const CACHE_TAGS = {
  websiteSettings: 'website-settings',
  publicCatalog: 'public-catalog',
  publicFeatures: 'public-features',
  listingsSearch: 'listings-search',
  listings: 'listings',
  offices: 'offices',
  sitemap: 'sitemap',
} as const;

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function listingTag(id: string): string {
  return `listing-${id}`;
}

export function listingMetricsTag(id: string): string {
  return `listing-metrics-${id}`;
}

export function listingSlugTag(slug: string): string {
  const digest = createHash('sha256').update(decodeSlug(slug).normalize('NFC')).digest('hex');
  return `listing-slug-${digest.slice(0, 32)}`;
}
