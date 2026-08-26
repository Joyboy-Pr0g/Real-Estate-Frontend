import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { AdminOfficeActionLogEntry, CursorPage } from '@/features/admin/types/action-logs';

export async function getAdminOfficeActionLogs(filters: {
  office_id?: string;
  cursor?: string;
  limit?: number;
} = {}): Promise<CursorPage<AdminOfficeActionLogEntry>> {
  const token = await getAuthToken();
  if (!token) return { items: [], next_cursor: null, has_more: false };

  const response = await serverFetch<AdminOfficeActionLogEntry[]>(backendPaths.auth.officeActionLogs, {
    token,
    cacheProfile: 'none',
    searchParams: {
      office_id: filters.office_id,
      cursor: filters.cursor,
      limit: filters.limit ?? 20,
    },
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}
