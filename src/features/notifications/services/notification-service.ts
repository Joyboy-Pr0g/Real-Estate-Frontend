import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import type { AppNotification, CursorPage } from '@/features/notifications/types/notification';

function unwrapList<T>(response: { data?: T[]; next_cursor?: string | null; has_more?: boolean }): CursorPage<T> {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function getMyNotifications(params: Record<string, string> = {}): Promise<CursorPage<AppNotification>> {
  const token = await getAuthToken();
  const response = await serverFetch<AppNotification[]>(backendPaths.notifications.list, {
    token,
    searchParams: params,
    cacheProfile: 'none',
  });
  return unwrapList(response);
}

export async function getNotificationUnreadCount(): Promise<number> {
  const token = await getAuthToken();
  if (!token) return 0;

  try {
    const response = await serverFetch<{ count: number }>(backendPaths.notifications.unreadCount, {
      token,
      cacheProfile: 'none',
    });
    return response.data?.count ?? 0;
  } catch {
    return 0;
  }
}
