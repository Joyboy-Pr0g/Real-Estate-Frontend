import { Suspense } from 'react';
import { AdminPropertyTypesContent } from '@/features/admin/components/property-types/AdminPropertyTypesContent';
import { Container } from '@/components/ui/container';

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminPropertyTypesPage(props: PageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminPropertyTypesContent {...props} />
      </Suspense>
    </Container>
  );
}
