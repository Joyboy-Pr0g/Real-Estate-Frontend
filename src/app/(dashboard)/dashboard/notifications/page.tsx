import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { NotificationsContent } from '@/features/notifications/components/NotificationsContent';

export const dynamic = 'force-dynamic';

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function DashboardNotificationsPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsContent audience="dashboard" />
      </Suspense>
    </Container>
  );
}
