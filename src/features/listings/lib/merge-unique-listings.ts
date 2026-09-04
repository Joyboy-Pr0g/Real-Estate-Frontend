import { PublicListing } from '@/features/listings/types/listing';

export function mergeUniqueListings(
  existing: PublicListing[],
  incoming: PublicListing[],
): PublicListing[] {
  if (incoming.length === 0) return existing;

  const seen = new Set(existing.map((listing) => listing.id));
  const merged = [...existing];

  for (const listing of incoming) {
    if (seen.has(listing.id)) continue;
    seen.add(listing.id);
    merged.push(listing);
  }

  return merged;
}
