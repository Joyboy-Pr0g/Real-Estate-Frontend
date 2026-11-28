import { Suspense } from 'react';
import { AdminTransactionTypesContent } from '@/features/admin/components/transaction-types/AdminTransactionTypesContent';
import { Container } from '@/components/ui/container';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminTransactionTypesPage(props: PageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminTransactionTypesContent {...props} />
      </Suspense>
    </Container>
  );
}
