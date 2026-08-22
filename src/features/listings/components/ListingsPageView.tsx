'use client';

import { PublicCatalog } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { ListingsFilterBar } from '@/features/listings/components/filter/ListingsFilterBar';
import { ListingsInfiniteGrid } from '@/features/listings/components/ListingsInfiniteGrid';
import { PublicListing } from '@/features/listings/types/listing';

interface ListingsPageViewProps {
  catalog: PublicCatalog;
  listings: PublicListing[];
  nextCursor: string | null;
  hasMore: boolean;
  initialNeighborhoods?: PublicNeighborhood[];
  initialPropertySubtypes?: PublicPropertySubtype[];
  title: string;
}

export function ListingsPageView({
  catalog,
  listings,
  nextCursor,
  hasMore,
  initialNeighborhoods,
  initialPropertySubtypes,
  title,
}: ListingsPageViewProps) {
  return (
    <div className="space-y-8">

      <ListingsFilterBar
        catalog={catalog}
        initialNeighborhoods={initialNeighborhoods}
        initialPropertySubtypes={initialPropertySubtypes}
      />

      <ListingsInfiniteGrid
        initialListings={listings}
        initialCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </div>
  );
}
