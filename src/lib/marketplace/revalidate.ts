import { revalidatePath, revalidateTag } from 'next/cache';
import { LEGAL_PAGE_PATHS } from '@/lib/seo/indexing';
import {
  CACHE_TAGS,
  listingMetricsTag,
  listingSlugTag,
  listingTag,
} from '@/lib/cache/tags';

const EXPIRE_IMMEDIATELY = { expire: 0 };

function revalidateTags(tags: string[]) {
  for (const tag of new Set(tags)) {
    revalidateTag(tag, EXPIRE_IMMEDIATELY);
  }
}

export function revalidateWebsiteSettingsMarketplace() {
  revalidateTags([CACHE_TAGS.websiteSettings, CACHE_TAGS.sitemap]);
  for (const path of LEGAL_PAGE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/robots.txt');
}

export function revalidatePublicCatalog() {
  revalidateTags([
    CACHE_TAGS.publicCatalog,
    CACHE_TAGS.listingsSearch,
    CACHE_TAGS.listings,
    CACHE_TAGS.offices,
  ]);
}

export function revalidateListingsMarketplace(
  options: { listingId?: string; slugs?: Array<string | undefined> } = {},
) {
  const { listingId, slugs = [] } = options;
  revalidateTags([
    CACHE_TAGS.listingsSearch,
    ...(listingId ? [listingTag(listingId), listingMetricsTag(listingId)] : []),
    ...slugs.filter((slug): slug is string => Boolean(slug)).map(listingSlugTag),
  ]);
}

export function revalidateAllListingsMarketplace() {
  revalidateTags([CACHE_TAGS.listingsSearch, CACHE_TAGS.listings]);
}

export function revalidateOfficesMarketplace() {
  revalidateTags([CACHE_TAGS.offices, CACHE_TAGS.listingsSearch, CACHE_TAGS.listings]);
}

export function revalidateIndividualListersMarketplace() {
  revalidateTags([CACHE_TAGS.listingsSearch, CACHE_TAGS.listings]);
}

export function revalidateUsersMarketplace() {
  revalidateTags([CACHE_TAGS.offices, CACHE_TAGS.listingsSearch, CACHE_TAGS.listings]);
}

export function revalidatePublicFeatures() {
  revalidateTags([CACHE_TAGS.publicFeatures, CACHE_TAGS.listings]);
}
