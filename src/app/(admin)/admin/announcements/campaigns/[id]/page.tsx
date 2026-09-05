import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { AdminAnnouncementDetailContent } from '@/features/admin/components/announcements/AdminAnnouncementDetailContent';

export const dynamic = 'force-dynamic';

interface AdminAnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-96 animate-pulse rounded-xl bg-gray-100" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default async function AdminAnnouncementDetailPage({ params }: AdminAnnouncementDetailPageProps) {
  const { id } = await params;

  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminAnnouncementDetailContent id={id} />
      </Suspense>
    </Container>
  );
}
