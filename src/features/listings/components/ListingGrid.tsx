import { PublicListing } from '@/features/listings/types/listing';
import { ListingCard } from '@/features/listings/components/ListingCard';

interface ListingGridProps {
  listings: PublicListing[];
  isAuthenticated?: boolean;
  savedIds?: string[];
}

export function ListingGrid({ listings, isAuthenticated = false, savedIds = [] }: ListingGridProps) {
  const savedSet = new Set(savedIds);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isAuthenticated={isAuthenticated}
          initialSaved={savedSet.has(listing.id)}
        />
      ))}
    </div>
  );
}
