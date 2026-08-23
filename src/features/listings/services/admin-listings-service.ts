import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { AdminListingsFilters, AdminListingsPage, AdminListingSummary } from '@/features/listings/types/listing';
import { PublicListingDetail } from '@/features/listings/types/listing-detail';

export async function getAdminListings(filters: AdminListingsFilters = {}): Promise<AdminListingsPage> {
  const token = await getAuthToken();
  if (!token) return { items: [], next_cursor: null, has_more: false };

  const response = await serverFetch<AdminListingSummary[]>(backendPaths.listings.adminList, {
    token,
    cacheProfile: 'none',
    searchParams: {
      status: filters.status,
      search: filters.search,
      property_type_id: filters.property_type_id,
      property_subtype_id: filters.property_subtype_id,
      transaction_type_id: filters.transaction_type_id,
      city_id: filters.city_id,
      neighborhood_id: filters.neighborhood_id,
      office_id: filters.office_id,
      individual_lister_id: filters.individual_lister_id,
      cursor: filters.cursor,
      limit: filters.limit ?? 20,
      include_deleted: filters.include_deleted ? 'true' : undefined,
    },
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function getAdminListingDetail(id: string): Promise<PublicListingDetail | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await serverFetch<PublicListingDetail>(backendPaths.listings.adminDetail(id), {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
