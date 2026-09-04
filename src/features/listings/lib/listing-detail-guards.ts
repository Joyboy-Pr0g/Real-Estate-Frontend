import { PublicListingDetail, PublicListingSeller } from '@/features/listings/types/listing-detail';

export function hasListingSeller(
  listing: PublicListingDetail | null | undefined,
): listing is PublicListingDetail & { seller: PublicListingSeller } {
  return Boolean(listing?.id && listing.seller?.type);
}
