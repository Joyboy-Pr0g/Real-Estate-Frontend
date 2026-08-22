import { PublicListing } from '@/features/listings/types/listing';
import { ListingCard } from '@/features/listings/components/ListingCard';

interface ListingGridProps {
  listings: PublicListing[];
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
