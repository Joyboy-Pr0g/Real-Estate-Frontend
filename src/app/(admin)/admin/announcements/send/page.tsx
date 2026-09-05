import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { AdminSendAnnouncementContent } from '@/features/admin/components/announcements/AdminSendAnnouncementContent';

export const dynamic = 'force-dynamic';

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminSendAnnouncementPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminSendAnnouncementContent />
      </Suspense>
    </Container>
  );
}
