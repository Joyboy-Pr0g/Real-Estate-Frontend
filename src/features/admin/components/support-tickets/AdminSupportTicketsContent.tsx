import { getAdminSupportTickets } from '@/features/support-tickets/services/support-ticket-service';
import { AdminSupportTicketsPanel } from '@/features/admin/components/support-tickets/AdminSupportTicketsPanel';
import { getSession } from '@/lib/auth/session';
import type { SupportTicketStatus } from '@/features/support-tickets/types/support-ticket';

interface AdminSupportTicketsContentProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    cursor?: string;
  }>;
}

export async function AdminSupportTicketsContent({ searchParams }: AdminSupportTicketsContentProps) {
  const params = await searchParams;
  const status = params.status as SupportTicketStatus | undefined;
  const search = params.search?.trim() || undefined;

  const page = await getAdminSupportTickets({
    limit: '50',
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
    ...(params.cursor ? { cursor: params.cursor } : {}),
  });

  const user = await getSession();

  return (
    <AdminSupportTicketsPanel
      user={user!}
      initial={page}
      initialStatus={status ?? ''}
      initialSearch={search ?? ''}
    />
  );
}
