import { serverFetch } from '@/lib/api/server';
import { appendSpecToSearchParams } from '@/features/listings/lib/spec-url';
import { backendPaths } from '@/lib/api/endpoints';
import { PublicListing } from '../types/listing';
import { ListingSearchQuery } from '../schemas/search-schema';

function buildSearchParams(params: ListingSearchQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {
    limit: params.limit ?? 24,
    sort: params.sort ?? 'created_at',
  };

  if (params.cursor) out.cursor = params.cursor;
  if (params.neighborhood_id) out.neighborhood_id = params.neighborhood_id;
  if (params.city_id) out.city_id = params.city_id;
  if (params.property_type_id) out.property_type_id = params.property_type_id;
  if (params.property_subtype_id) out.property_subtype_id = params.property_subtype_id;
  if (params.transaction_type_id) out.transaction_type_id = params.transaction_type_id;
  if (params.min_price) out.min_price = params.min_price;
  if (params.max_price) out.max_price = params.max_price;

  if (params.spec) {
    const specParams = new URLSearchParams();
    appendSpecToSearchParams(specParams, params.spec);
    for (const [key, value] of specParams.entries()) {
      out[key] = value;
    }
  }

  return out;
}

export const listingService = {
  async search(params: ListingSearchQuery = {}) {
    const response = await serverFetch<PublicListing[]>(backendPaths.listings.search, {
      cacheProfile: 'short',
      searchParams: buildSearchParams(params),
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getFeatured(limit = 8) {
    return this.search({ limit, sort: 'created_at' });
  },
};
