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

export interface SavedListingItem extends PublicListing {
  saved_at: string;
}

export interface ViewedListingItem extends PublicListing {
  viewed_at: string;
}

export type MyListingReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface MyListingReport {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_slug: string;
  reason: string;
  description: string | null;
  status: MyListingReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminListingSummary extends PublicListing {
  custom_id: number;
  deleted_at: string | null;
  seller_type: 'office' | 'individual' | null;
  seller_name: string | null;
}

export interface AdminListingsFilters {
  status?: PublicListing['status'];
  search?: string;
  property_type_id?: string;
  property_subtype_id?: string;
  transaction_type_id?: string;
  city_id?: string;
  neighborhood_id?: string;
  office_id?: string;
  individual_lister_id?: string;
  include_deleted?: boolean;
  cursor?: string;
  limit?: number;
}

export interface AdminListingsPage {
  items: AdminListingSummary[];
  next_cursor: string | null;
  has_more: boolean;
}
