import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ListingsMapContent } from '@/features/listings/components/ListingsMapContent';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { getWebsiteSettingsForMetadata, buildPageMetadata } from '@/lib/seo/metadata';
import { getListingsMapCanonicalPath, hasSearchFilters } from '@/lib/seo/indexing';

interface ListingsMapPageProps {
  searchParams: Promise<ListingSearchUrlParams>;
}

export async function generateMetadata({ searchParams }: ListingsMapPageProps): Promise<Metadata> {
  const params = await searchParams;
  const settings = await getWebsiteSettingsForMetadata();
  const filtered = hasSearchFilters(params);
  const allowSearchIndexing = settings.index_listing_search_pages && !filtered;

  return buildPageMetadata(settings, {
    title: 'خريطة العقارات',
    description: 'استكشف قوائم العقارات على خريطة متفاعلة لليمن.',
    path: getListingsMapCanonicalPath(),
    robots: allowSearchIndexing ? undefined : { index: false, follow: true },
  });
}

function MapPageFallback() {
  return (
    <div className="flex h-[calc(100dvh-68px)] items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  );
}

export default function ListingsMapPage(props: ListingsMapPageProps) {
  return (
    <Suspense fallback={<MapPageFallback />}>
      <ListingsMapContent {...props} />
    </Suspense>
  );
}
