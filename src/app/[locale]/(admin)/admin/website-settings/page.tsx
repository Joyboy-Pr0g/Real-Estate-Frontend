import { Suspense } from 'react';
import { AdminWebsiteSettingsContent } from '@/features/admin/components/website-settings/AdminWebsiteSettingsContent';
import { Container } from '@/components/ui/container';

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminWebsiteSettingsPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminWebsiteSettingsContent />
      </Suspense>
    </Container>
  );
}
