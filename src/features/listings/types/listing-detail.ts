import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';

export interface PublicListingCatalogItemDetailed {
  name: string;
  icon: string | null;
  slug: string;
}

export interface PublicListingPropertySubtype extends PublicListingCatalogItemDetailed {
  spec_schema?: PropertySpecSchema | null;
}

export interface ListingDetailOffice {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  city_name: string;
  neighborhood_name: string;
  address: string;
  photo_url: string;
  verification_status: string;
}

export interface ListingDetailIndividualLister {
  id: string;
  name: string;
  phone_number: string;
  verification_status: string;
}

export type PublicListingSeller =
  | ({ type: 'office' } & ListingDetailOffice)
  | ({ type: 'individual' } & ListingDetailIndividualLister);

export interface ListingDetailCity {
  id: string;
  name: string;
  pcode: string;
}

// The backend's own TS type only guarantees {id, name}, but the runtime
// payload is the full Neighborhood row. Every field beyond id/name is
// modeled as optional so the UI degrades instead of asserting a shape
// that might not arrive.
export interface ListingDetailNeighborhood {
  id: string;
  city_id?: string;
  name: string;
  neighb_pcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  population?: number | null;
  total_idps?: number | null;
  avg_age?: number | null;
  avg_female?: number | null;
  avg_male?: number | null;
}

export interface ListingDetailPhoto {
  url: string;
  public_id: string;
  is_main: boolean;
  order: number;
}

export type ListingPropertySpecs = Record<string, string | number | boolean>;

export interface ListingHistoryEntry {
  id: string;
  action: 'sold' | 'rented';
  price: string;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface PublicListingDetail {
  id: string;
  custom_id: number;
  title: string;
  slug: string;
  price: string;
  description: string;
  seller: PublicListingSeller;
  property_type: PublicListingCatalogItemDetailed;
  transaction_type: PublicListingCatalogItemDetailed & { display_name_ar: string };
  property_subtype: PublicListingPropertySubtype;
  city: ListingDetailCity;
  neighborhood: ListingDetailNeighborhood;
  address: string;
  latitude: string;
  longitude: string;
  property_specs: ListingPropertySpecs;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  features_ids: string[];
  histories: ListingHistoryEntry[];
  photos: ListingDetailPhoto[];
  video_url: string | null;
  video_public_id: string | null;
  video_thumbnail: string | null;
}
