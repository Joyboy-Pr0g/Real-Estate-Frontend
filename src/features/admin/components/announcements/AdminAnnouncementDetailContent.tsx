import { notFound } from 'next/navigation';
import { getAdminAnnouncement } from '@/features/admin/services/admin-announcements-service';
import { AdminAnnouncementDetailPanel } from '@/features/admin/components/announcements/AdminAnnouncementDetailPanel';

interface AdminAnnouncementDetailContentProps {
  id: string;
}

export async function AdminAnnouncementDetailContent({ id }: AdminAnnouncementDetailContentProps) {
  const announcement = await getAdminAnnouncement(id);
  if (!announcement) notFound();
  return <AdminAnnouncementDetailPanel announcement={announcement} />;
}
