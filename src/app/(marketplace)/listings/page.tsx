import { Suspense } from 'react';
import { ListingsContent } from '@/features/listings/components/ListingsContent';
import { ListingGridSkeleton } from '@/features/shared/components/LoadingSkeletons';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';

interface ListingsPageProps {
  searchParams: Promise<ListingSearchUrlParams>;
}

export default function ListingsPage(props: ListingsPageProps) {
  return (
    <Suspense fallback={<ListingGridSkeleton count={8} />}>
      <ListingsContent {...props} />
    </Suspense>
  );
}
