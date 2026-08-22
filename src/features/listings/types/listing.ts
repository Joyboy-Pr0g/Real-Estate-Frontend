export interface PublicListingCatalogItem {
  name: string;
  icon: string | null;
}

export interface PublicListing {
  id: string;
  title: string;
  slug: string;
  price: string;
  property_type: PublicListingCatalogItem;
  transaction_type: PublicListingCatalogItem;
  property_subtype: PublicListingCatalogItem;
  city_name: string;
  neighborhood_name: string;
  address: string;
  latitude: string;
  longitude: string;
  status: 'published' | 'draft' | 'sold' | 'rented';
  main_photo: string | null;
  published_at: string | null;
  created_at: string;
}

export interface ListingSearchResult {
  items: PublicListing[];
  next_cursor: string | null;
  has_more: boolean;
}
