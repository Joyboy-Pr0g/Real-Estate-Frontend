import { Suspense } from 'react';
import { AdminContactsContent } from '@/features/admin/components/contacts/AdminContactsContent';
import { Container } from '@/components/ui/container';

interface AdminContactsPageProps {
  searchParams: Promise<{
    full_name?: string;
    email?: string;
    subject?: string;
    has_replied?: string;
    cursor?: string;
  }>;
}

function ContactsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminContactsPage(props: AdminContactsPageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<ContactsTableSkeleton />}>
        <AdminContactsContent {...props} />
      </Suspense>
    </Container>
  );
}
