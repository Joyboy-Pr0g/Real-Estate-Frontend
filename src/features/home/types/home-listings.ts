import { PublicListing } from '@/features/listings/types/listing';

export interface HomePropertyTypeSection {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  listings: PublicListing[];
}
