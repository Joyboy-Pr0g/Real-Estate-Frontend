import { Suspense } from 'react';
import { AdminUsersContent } from '@/features/admin/components/users/AdminUsersContent';
import { Container } from '@/components/ui/container';

interface AdminUsersPageProps {
  searchParams: Promise<{
    role?: string;
    status?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminUsersPage(props: AdminUsersPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<UsersTableSkeleton />}>
        <AdminUsersContent {...props} />
      </Suspense>
    </Container>
  );
}
