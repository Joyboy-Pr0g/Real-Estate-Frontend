import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { AnnouncementDetailView } from '@/features/announcements/components/AnnouncementDetailView';
import { getAnnouncement } from '@/features/announcements/services/announcement-service';

export const dynamic = 'force-dynamic';

interface AnnouncementPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardAnnouncementPage({ params }: AnnouncementPageProps) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  return (
    <Container className="py-8">
      <AnnouncementDetailView announcement={announcement} />
    </Container>
  );
}
