import { Suspense } from 'react';
import { SupportTicketsContent } from '@/features/support-tickets/components/SupportTicketsContent';
import { Container } from '@/components/ui/container';

function SupportTicketsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function SupportTicketsPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<SupportTicketsSkeleton />}>
        <SupportTicketsContent />
      </Suspense>
    </Container>
  );
}
