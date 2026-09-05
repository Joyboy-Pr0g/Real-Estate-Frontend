import type { MessageItem } from '@/features/messaging/types/messaging';
import type { SupportTicketMessageItem, SupportTicketStatus } from '@/features/support-tickets/types/support-ticket';

export function toMessageBubbleItem(message: SupportTicketMessageItem): MessageItem {
  return {
    id: message.id,
    sender_id: message.sender_id,
    message_type: message.message_type,
    content: message.content,
    media: message.media,
    created_at: message.created_at,
    deleted: false,
  };
}

export function requesterName(requester?: { f_name: string; l_name: string }) {
  if (!requester) return '';
  return `${requester.f_name} ${requester.l_name}`.trim();
}

export function formatTicketStatusKey(status: SupportTicketStatus) {
  return `dashboard.supportTickets.status.${status}` as const;
}
