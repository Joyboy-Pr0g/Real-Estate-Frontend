import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { OfficeActionLogEntry, CursorPage } from '@/features/admin/types/action-logs';

export async function getOfficeUserActionLogs(
  officeId: string,
  userId: string,
  filters: { cursor?: string; limit?: number } = {},
): Promise<CursorPage<OfficeActionLogEntry>> {
  const token = await getAuthToken();
  if (!token) return { items: [], next_cursor: null, has_more: false };

  try {
    const response = await serverFetch<OfficeActionLogEntry[]>(
      backendPaths.offices.userActionLogs(officeId, userId),
      {
        token,
        cacheProfile: 'none',
        searchParams: {
          cursor: filters.cursor,
          limit: filters.limit ?? 20,
        },
      },
    );

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: Boolean(response.has_more),
    };
  } catch {
    return { items: [], next_cursor: null, has_more: false };
  }
}
