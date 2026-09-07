import { OfficeActionLogEntry } from '@/features/admin/types/action-logs';
import { serverFetch } from '@/lib/api/server';
import { appendSpecToSearchParams } from '@/features/listings/lib/spec-url';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import { ListingGoneError } from '@/lib/errors/listing-gone-error';
import { getAuthToken } from '@/lib/auth/session';
import { MyListingReport, MyListingSummary, PublicListing, SavedListingItem, ViewedListingItem } from '../types/listing';
import { hasListingSeller } from '../lib/listing-detail-guards';
import { PublicListingDetail } from '../types/listing-detail';
import { NearByPointCategory, NearByPointsResult } from '../types/near-by-points';
import { ListingSearchQuery } from '../schemas/search-schema';

interface CursorParams {
  cursor?: string;
  limit?: number;
}

function buildCursorParams(params: CursorParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (params.cursor) out.cursor = params.cursor;
  if (params.limit) out.limit = params.limit;
  return out;
}

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
  if (params.office_id) out.office_id = params.office_id;
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

  async getById(id: string): Promise<PublicListingDetail | null> {
    try {
      const response = await serverFetch<PublicListingDetail>(backendPaths.listings.getById(id), {
        cacheProfile: 'short',
      });
      return response.data ?? null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async getBySlug(slug: string): Promise<PublicListingDetail | null> {
    try {
      const response = await serverFetch<PublicListingDetail>(backendPaths.listings.getBySlug(slug), {
        cacheProfile: 'none',
      });
      const listing = response.data ?? null;
      if (!listing) return null;

      if (hasListingSeller(listing)) return listing;

      const retry = await serverFetch<PublicListingDetail>(backendPaths.listings.getBySlug(slug), {
        cacheProfile: 'none',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const retried = retry.data ?? null;
      return hasListingSeller(retried) ? retried : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 410) {
        throw new ListingGoneError(slug);
      }
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async getNearByPoints(
    id: string,
    params: { category?: NearByPointCategory; radius?: number },
  ): Promise<NearByPointsResult | null> {
    const response = await serverFetch<NearByPointsResult>(backendPaths.listings.nearByPoints(id), {
      cacheProfile: 'short',
      searchParams: {
        ...(params.category ? { category: params.category } : {}),
        ...(params.radius ? { radius: params.radius } : {}),
      },
    });
    return response.data ?? null;
  },

  async getSavedListingIds(listingIds: string[]): Promise<string[]> {
    if (listingIds.length === 0) return [];

    const token = await getAuthToken();
    if (!token) return [];

    const response = await serverFetch<string[]>(backendPaths.listings.checkSaved, {
      token,
      method: 'POST',
      cacheProfile: 'none',
      body: { listing_ids: listingIds },
    });

    return response.data ?? [];
  },

  async getMySaved(params: CursorParams = {}) {
    const token = await getAuthToken();
    if (!token) return { items: [], next_cursor: null, has_more: false };

    const response = await serverFetch<SavedListingItem[]>(backendPaths.listings.saved, {
      token,
      cacheProfile: 'none',
      searchParams: buildCursorParams(params),
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getMyViewHistory(params: CursorParams = {}) {
    const token = await getAuthToken();
    if (!token) return { items: [], next_cursor: null, has_more: false };

    const response = await serverFetch<ViewedListingItem[]>(backendPaths.listings.myViewHistory, {
      token,
      cacheProfile: 'none',
      searchParams: buildCursorParams(params),
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getMyListingById(id: string): Promise<PublicListingDetail | null> {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const response = await serverFetch<PublicListingDetail>(backendPaths.listings.mine(id), {
        token,
        cacheProfile: 'none',
      });
      return response.data ?? null;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 403)) return null;
      throw error;
    }
  },

  async getMyListings(
    params: CursorParams & {
      status?: string;
      search?: string;
      property_type_id?: string;
      property_subtype_id?: string;
      transaction_type_id?: string;
      city_id?: string;
      neighborhood_id?: string;
      office_id?: string;
    } = {},
  ) {
    const token = await getAuthToken();
    if (!token) return { items: [], next_cursor: null, has_more: false };

    const response = await serverFetch<MyListingSummary[]>(backendPaths.listings.myListings, {
      token,
      cacheProfile: 'none',
      searchParams: {
        ...buildCursorParams(params),
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.property_type_id ? { property_type_id: params.property_type_id } : {}),
        ...(params.property_subtype_id ? { property_subtype_id: params.property_subtype_id } : {}),
        ...(params.transaction_type_id ? { transaction_type_id: params.transaction_type_id } : {}),
        ...(params.city_id ? { city_id: params.city_id } : {}),
        ...(params.neighborhood_id ? { neighborhood_id: params.neighborhood_id } : {}),
        ...(params.office_id ? { office_id: params.office_id } : {}),
      },
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getMyReports(params: CursorParams & { status?: string } = {}) {
    const token = await getAuthToken();
    if (!token) return { items: [], next_cursor: null, has_more: false };

    const response = await serverFetch<MyListingReport[]>(backendPaths.listings.myReports, {
      token,
      cacheProfile: 'none',
      searchParams: {
        ...buildCursorParams(params),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getListingOfficeActionLogs(listingId: string, params: { cursor?: string; limit?: number } = {}) {
    const token = await getAuthToken();
    if (!token) return { items: [], next_cursor: null, has_more: false };

    try {
      const response = await serverFetch<OfficeActionLogEntry[]>(
        backendPaths.listings.listingOfficeActionLogs(listingId),
        {
          token,
          cacheProfile: 'none',
          searchParams: {
            cursor: params.cursor,
            limit: params.limit ?? 20,
          },
        },
      );

      return {
        items: response.data ?? [],
        next_cursor: response.next_cursor ?? null,
        has_more: response.has_more ?? false,
      };
    } catch {
      return { items: [], next_cursor: null, has_more: false };
    }
  },
};
