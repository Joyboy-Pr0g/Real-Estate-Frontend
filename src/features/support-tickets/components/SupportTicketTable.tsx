'use client';

import { SupportTicketActionsMenu } from '@/features/support-tickets/components/SupportTicketActionsMenu';
import { SupportTicketStatusBadge } from '@/features/support-tickets/components/SupportTicketStatusBadge';
import { requesterName } from '@/features/support-tickets/components/support-ticket-utils';
import type { SupportTicketInboxRow } from '@/features/support-tickets/types/support-ticket';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SupportTicketTableProps {
  tickets: SupportTicketInboxRow[];
  showRequester?: boolean;
  openingTicketId?: string | null;
  onOpenTicket: (ticket: SupportTicketInboxRow) => void;
}

export function SupportTicketTable({
  tickets,
  showRequester = false,
  openingTicketId = null,
  onOpenTicket,
}: SupportTicketTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.supportTickets.subject')}</th>
              {showRequester ? (
                <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.supportTickets.requester')}</th>
              ) : null}
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.supportTickets.lastPreview')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.supportTickets.lastActivity')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onOpenTicket(ticket)}
                    className="text-start font-semibold text-primary-dark hover:text-brand hover:underline"
                  >
                    {ticket.subject}
                  </button>
                  <p className="text-xs text-gray-400">{formatDateTime(ticket.created_at)}</p>
                </td>
                {showRequester ? (
                  <td className="px-5 py-4">
                    {ticket.requester ? (
                      <>
                        <p className="font-medium text-gray-800">{requesterName(ticket.requester)}</p>
                        <p className="text-xs text-gray-500">{ticket.requester.email}</p>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ) : null}
                <td className="px-5 py-4">
                  <SupportTicketStatusBadge status={ticket.status} />
                </td>
                <td className="max-w-xs px-5 py-4 text-gray-600">
                  <p className="truncate">{ticket.last_message_preview ?? t('dashboard.supportTickets.noMessagesYet')}</p>
                </td>
                <td className="px-5 py-4 text-gray-500">
                  {ticket.last_message_at ? formatDateTime(ticket.last_message_at) : '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <SupportTicketActionsMenu
                      disabled={openingTicketId === ticket.id}
                      onViewConversation={() => onOpenTicket(ticket)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
