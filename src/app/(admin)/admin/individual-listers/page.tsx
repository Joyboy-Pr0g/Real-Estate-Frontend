import { Suspense } from 'react';
import { AdminIndividualListersContent } from '@/features/admin/components/individual-listers/AdminIndividualListersContent';
import { Container } from '@/components/ui/container';

interface AdminIndividualListersPageProps {
  searchParams: Promise<{
    verificationStatus?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

function ListersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminIndividualListersPage(props: AdminIndividualListersPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<ListersTableSkeleton />}>
        <AdminIndividualListersContent {...props} />
      </Suspense>
    </Container>
  );
}
