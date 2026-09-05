import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import type { AnnouncementPublic } from '@/features/admin/types/admin-announcement';

export async function getAnnouncement(id: string): Promise<AnnouncementPublic | null> {
  const token = await getAuthToken();
  const response = await serverFetch<AnnouncementPublic>(backendPaths.announcements.byId(id), {
    token,
    cache: 'no-store',
  });
  return response.data ?? null;
}
