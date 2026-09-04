import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import { PublicListing } from '@/features/listings/types/listing';
import {
  PublicOfficeDetail,
  PublicOfficesPage,
  PublicOfficesSearchParams,
} from '@/features/office/types/public-office';

function buildOfficeSearchParams(params: PublicOfficesSearchParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (params.cityId) out.cityId = params.cityId;
  if (params.neighborhoodId) out.neighborhoodId = params.neighborhoodId;
  if (params.search?.trim()) out.search = params.search.trim();
  if (params.cursor) out.cursor = params.cursor;
  if (params.limit) out.limit = params.limit;
  return out;
}

export const publicOfficeService = {
  async search(params: PublicOfficesSearchParams = {}): Promise<PublicOfficesPage> {
    const response = await serverFetch<PublicOfficesPage['items']>(backendPaths.offices.public, {
      cacheProfile: 'short',
      searchParams: buildOfficeSearchParams({ limit: 24, ...params }),
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },

  async getByName(name: string): Promise<PublicOfficeDetail | null> {
    try {
      const response = await serverFetch<PublicOfficeDetail>(
        backendPaths.offices.publicByName(name),
        { cacheProfile: 'none' },
      );
      return response.data ?? null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async getListings(
    name: string,
    params: { cursor?: string; limit?: number } = {},
  ): Promise<{ items: PublicListing[]; next_cursor: string | null; has_more: boolean }> {
    const response = await serverFetch<PublicListing[]>(
      backendPaths.offices.publicListingsByName(name),
      {
        cacheProfile: 'none',
        searchParams: {
          ...(params.cursor ? { cursor: params.cursor } : {}),
          limit: params.limit ?? 8,
        },
      },
    );

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  },
};
