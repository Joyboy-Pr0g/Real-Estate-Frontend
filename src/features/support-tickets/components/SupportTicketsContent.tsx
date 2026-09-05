import { redirect } from 'next/navigation';
import { getCanCreateTicket, getSupportTickets } from '@/features/support-tickets/services/support-ticket-service';
import { SupportTicketsPanel } from '@/features/support-tickets/components/SupportTicketsPanel';
import { getSession } from '@/lib/auth/session';

export async function SupportTicketsContent() {
  const user = await getSession();
  const [page, canCreate] = await Promise.all([
    getSupportTickets({ limit: '50' }),
    getCanCreateTicket(),
  ]);

  if (!canCreate.allowed && canCreate.reason === 'not_eligible') {
    redirect('/dashboard');
  }

  return (
    <SupportTicketsPanel
      user={user!}
      initial={page}
      canCreate={canCreate}
    />
  );
}
