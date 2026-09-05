import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import type {
  AnnouncementDetail,
  AnnouncementListItem,
  AnnouncementsPage,
} from '@/features/admin/types/admin-announcement';

function unwrapList(response: {
  data?: AnnouncementListItem[];
  next_cursor?: string | null;
  has_more?: boolean;
}): AnnouncementsPage {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function getAdminAnnouncements(params: Record<string, string> = {}): Promise<AnnouncementsPage> {
  const token = await getAuthToken();
  const response = await serverFetch<AnnouncementListItem[]>(backendPaths.announcements.admin.list, {
    token,
    searchParams: params,
    cache: 'no-store',
    cacheProfile: 'none',
  });
  return unwrapList(response);
}

export async function getAdminAnnouncement(id: string): Promise<AnnouncementDetail | null> {
  const token = await getAuthToken();
  try {
    const response = await serverFetch<AnnouncementDetail>(backendPaths.announcements.admin.byId(id), {
      token,
      cache: 'no-store',
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
