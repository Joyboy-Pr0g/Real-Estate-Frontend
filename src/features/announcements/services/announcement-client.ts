'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { AnnouncementPublic } from '@/features/admin/types/admin-announcement';

export async function fetchAnnouncement(id: string): Promise<AnnouncementPublic> {
  const response = await clientFetch<AnnouncementPublic>(bffPaths.announcements.byId(id), {
    cache: 'no-store',
  });
  return response.data!;
}
