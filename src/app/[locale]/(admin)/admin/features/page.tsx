import { Suspense } from 'react';
import { AdminMainFeaturesContent } from '@/features/admin/components/features/AdminMainFeaturesContent';
import { Container } from '@/components/ui/container';

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminFeaturesPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminMainFeaturesContent />
      </Suspense>
    </Container>
  );
}
