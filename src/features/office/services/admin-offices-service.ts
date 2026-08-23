import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { AdminOfficesFilters, AdminOfficesPage, OfficeDetail } from '@/features/office/types/office';

export async function getAdminOffices(filters: AdminOfficesFilters = {}): Promise<AdminOfficesPage> {
  const token = await getAuthToken();
  if (!token) return { items: [], next_cursor: null, has_more: false };

  const response = await serverFetch<OfficeDetail[]>(backendPaths.offices.list, {
    token,
    cacheProfile: 'none',
    searchParams: {
      verificationStatus: filters.verificationStatus,
      search: filters.search,
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
