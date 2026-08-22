export const LISTING_URL_PARAMS = {
  propertyType: 'property_type',
  propertySubtype: 'property_subtype',
  transactionType: 'transaction_type',
  city: 'city',
  neighborhood: 'neighborhood',
  minPrice: 'min_price',
  maxPrice: 'max_price',
  sort: 'sort',
  cursor: 'cursor',
  limit: 'limit',
} as const;

export type ListingUrlParamKey = (typeof LISTING_URL_PARAMS)[keyof typeof LISTING_URL_PARAMS];
