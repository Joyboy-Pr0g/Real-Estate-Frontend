'use client';

import { SupportTicketActionsMenu } from '@/features/support-tickets/components/SupportTicketActionsMenu';
import { SupportTicketStatusBadge } from '@/features/support-tickets/components/SupportTicketStatusBadge';
import { requesterName } from '@/features/support-tickets/components/support-ticket-utils';
import type { SupportTicketInboxRow } from '@/features/support-tickets/types/support-ticket';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SupportTicketCardProps {
  ticket: SupportTicketInboxRow;
  showRequester?: boolean;
  openingTicketId?: string | null;
  onOpenTicket: (ticket: SupportTicketInboxRow) => void;
}

export function SupportTicketCard({
  ticket,
  showRequester = false,
  openingTicketId = null,
  onOpenTicket,
}: SupportTicketCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpenTicket(ticket)}
          className="min-w-0 text-start"
        >
          <p className="truncate font-semibold text-primary-dark hover:text-brand">{ticket.subject}</p>
          {showRequester && ticket.requester ? (
            <p className="truncate text-sm text-gray-500">{requesterName(ticket.requester)}</p>
          ) : null}
        </button>
        <SupportTicketActionsMenu
          disabled={openingTicketId === ticket.id}
          onViewConversation={() => onOpenTicket(ticket)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SupportTicketStatusBadge status={ticket.status} />
      </div>

      <div className="mt-3 grid gap-1 text-sm text-gray-500">
        <p className="line-clamp-2">{ticket.last_message_preview ?? t('dashboard.supportTickets.noMessagesYet')}</p>
        <p>
          {ticket.last_message_at
            ? `${t('dashboard.supportTickets.lastActivity')}: ${formatDateTime(ticket.last_message_at)}`
            : formatDateTime(ticket.created_at)}
        </p>
      </div>
    </article>
  );
}
