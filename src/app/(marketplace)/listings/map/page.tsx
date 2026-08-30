import { Suspense } from 'react';
import { ListingsMapContent } from '@/features/listings/components/ListingsMapContent';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';

interface ListingsMapPageProps {
  searchParams: Promise<ListingSearchUrlParams>;
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
