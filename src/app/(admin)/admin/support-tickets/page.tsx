import { Suspense } from 'react';
import { AdminSupportTicketsContent } from '@/features/admin/components/support-tickets/AdminSupportTicketsContent';
import { Container } from '@/components/ui/container';

interface AdminSupportTicketsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    cursor?: string;
  }>;
}

function SupportTicketsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminSupportTicketsPage(props: AdminSupportTicketsPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<SupportTicketsTableSkeleton />}>
        <AdminSupportTicketsContent {...props} />
      </Suspense>
    </Container>
  );
}
