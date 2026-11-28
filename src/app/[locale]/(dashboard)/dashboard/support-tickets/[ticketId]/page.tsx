import { redirect } from 'next/navigation';

export default function LegacySupportTicketPage() {
  redirect('/dashboard/support-tickets');
}
