import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { AdminAnnouncementsListContent } from '@/features/admin/components/announcements/AdminAnnouncementsListContent';

export const dynamic = 'force-dynamic';

interface AdminAnnouncementsCampaignsPageProps {
  searchParams: Promise<{
    status?: string;
    cursor?: string;
  }>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminAnnouncementsCampaignsPage(props: AdminAnnouncementsCampaignsPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminAnnouncementsListContent searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}
