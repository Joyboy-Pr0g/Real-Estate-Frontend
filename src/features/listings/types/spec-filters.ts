export interface ListingSpecNumberFilter {
  min?: number;
  max?: number;
}

export type ListingSpecFilterValue =
  | string
  | boolean
  | ListingSpecNumberFilter;

export type ListingSpecFilters = Record<string, ListingSpecFilterValue>;
