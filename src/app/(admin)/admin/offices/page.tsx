import { Suspense } from 'react';
import { AdminOfficesContent } from '@/features/admin/components/offices/AdminOfficesContent';
import { Container } from '@/components/ui/container';

interface AdminOfficesPageProps {
  searchParams: Promise<{
    verificationStatus?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

function OfficesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminOfficesPage(props: AdminOfficesPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<OfficesTableSkeleton />}>
        <AdminOfficesContent {...props} />
      </Suspense>
    </Container>
  );
}
