import { getAdminAnnouncements } from '@/features/admin/services/admin-announcements-service';
import { AdminAnnouncementsListPanel } from '@/features/admin/components/announcements/AdminAnnouncementsListPanel';
import type { AnnouncementStatus } from '@/features/admin/types/admin-announcement';

interface AdminAnnouncementsListContentProps {
  searchParams: Promise<{
    status?: string;
    cursor?: string;
  }>;
}

export async function AdminAnnouncementsListContent({ searchParams }: AdminAnnouncementsListContentProps) {
  const params = await searchParams;
  const status = params.status as AnnouncementStatus | undefined;

  const page = await getAdminAnnouncements({
    limit: '30',
    ...(status ? { status } : {}),
    ...(params.cursor ? { cursor: params.cursor } : {}),
  });

  return <AdminAnnouncementsListPanel initial={page} initialStatus={status ?? ''} />;
}
