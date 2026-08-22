import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import {
  AdminUserListItem,
  AdminUserSearchParams,
  AdminUsersPage,
} from '@/features/auth/types/user';

const DEFAULT_LIMIT = 20;

export async function getAdminUsers(
  params: AdminUserSearchParams = {},
): Promise<AdminUsersPage> {
  const token = await getAuthToken();
  if (!token) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const response = await serverFetch<AdminUserListItem[]>(backendPaths.auth.users, {
    token,
    cacheProfile: 'none',
    searchParams: {
      role: params.role,
      status: params.status,
      search: params.search,
      cursor: params.cursor,
      limit: params.limit ?? DEFAULT_LIMIT,
      include_deleted: params.include_deleted ? 'true' : undefined,
    },
  });

  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}
