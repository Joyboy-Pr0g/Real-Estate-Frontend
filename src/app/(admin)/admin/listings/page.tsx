import { Suspense } from 'react';
import { AdminListingsContent } from '@/features/admin/components/listings/AdminListingsContent';
import { Container } from '@/components/ui/container';

interface AdminListingsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

function ListingsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminListingsPage(props: AdminListingsPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<ListingsTableSkeleton />}>
        <AdminListingsContent {...props} />
      </Suspense>
    </Container>
  );
}
