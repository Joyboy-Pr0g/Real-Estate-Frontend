export type ListingSearchUrlParams = {
  property_type?: string;
  property_subtype?: string;
  transaction_type?: string;
  city?: string;
  neighborhood?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  cursor?: string;
  limit?: string;
} & Record<string, string | string[] | undefined>;
