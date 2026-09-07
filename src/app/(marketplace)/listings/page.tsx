import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ListingsContent } from '@/features/listings/components/ListingsContent';
import { ListingGridSkeleton } from '@/features/shared/components/LoadingSkeletons';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { getWebsiteSettingsForMetadata, buildPageMetadata } from '@/lib/seo/metadata';
import { getListingsCanonicalPath, hasSearchFilters } from '@/lib/seo/indexing';

interface ListingsPageProps {
  searchParams: Promise<ListingSearchUrlParams>;
}

export async function generateMetadata({ searchParams }: ListingsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const settings = await getWebsiteSettingsForMetadata();
  const filtered = hasSearchFilters(params);
  const allowSearchIndexing = settings.index_listing_search_pages && !filtered;

  return buildPageMetadata(settings, {
    title: 'قوائم العقارات',
    description: 'تصفح العقارات المعروضة للبيع والإيجار في اليمن.',
    path: getListingsCanonicalPath(params),
    robots: allowSearchIndexing ? undefined : { index: false, follow: true },
  });
}

export default function ListingsPage(props: ListingsPageProps) {
  return (
    <Suspense fallback={<ListingGridSkeleton count={8} />}>
      <ListingsContent {...props} />
    </Suspense>
  );
}
