'use client';

import { PublicCatalog } from '@/features/catalog/types/catalog';
import { ListingsFilterBar } from '@/features/listings/components/filter/ListingsFilterBar';
import { ListingsInfiniteGrid } from '@/features/listings/components/ListingsInfiniteGrid';
import { PublicListing } from '@/features/listings/types/listing';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';

interface ListingsPageViewProps {
  catalog: PublicCatalog;
  listings: PublicListing[];
  nextCursor: string | null;
  hasMore: boolean;
  initialSearchKey: string;
  isAuthenticated?: boolean;
}

export function ListingsPageView({
  catalog,
  listings,
  nextCursor,
  hasMore,
  initialSearchKey,
  isAuthenticated = false,
}: ListingsPageViewProps) {
  return (
    <div className="space-y-8">
      <ListingsFilterBar catalog={catalog} isAuthenticated={isAuthenticated} />

      <ListingsInfiniteGrid
        initialListings={listings}
        initialCursor={nextCursor}
        initialHasMore={hasMore}
        initialSearchKey={initialSearchKey}
      />

      <ScrollToTopButton />
    </div>
  );
}
