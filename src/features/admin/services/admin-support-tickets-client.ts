'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type {
  CursorPage,
  SupportTicketDetail,
  SupportTicketInboxRow,
  SupportTicketMessageItem,
  SupportTicketStatus,
} from '@/features/support-tickets/types/support-ticket';

export async function fetchAdminSupportTickets(params: Record<string, string> = {}) {
  const response = await clientFetch<SupportTicketInboxRow[]>(bffPaths.supportTickets.admin.tickets, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  } satisfies CursorPage<SupportTicketInboxRow>;
}

export async function fetchAdminSupportTicket(ticketId: string) {
  return clientFetch<SupportTicketDetail>(bffPaths.supportTickets.admin.ticket(ticketId));
}

export async function fetchAdminSupportTicketMessages(ticketId: string, params: Record<string, string> = {}) {
  const response = await clientFetch<SupportTicketMessageItem[]>(bffPaths.supportTickets.admin.messages(ticketId), {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  } satisfies CursorPage<SupportTicketMessageItem>;
}

export async function sendAdminSupportTicketText(ticketId: string, content: string) {
  return clientFetch<SupportTicketMessageItem>(bffPaths.supportTickets.admin.messages(ticketId), {
    method: 'POST',
    body: { content },
  });
}

export async function sendAdminSupportTicketImage(ticketId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message_type', 'image');
  return clientFetch<SupportTicketMessageItem>(bffPaths.supportTickets.admin.messagesMedia(ticketId), {
    method: 'POST',
    body: formData,
  });
}

export async function updateAdminSupportTicketStatus(ticketId: string, status: SupportTicketStatus) {
  return clientFetch<SupportTicketDetail>(bffPaths.supportTickets.admin.status(ticketId), {
    method: 'PATCH',
    body: { status },
  });
}

export async function deleteAdminSupportTicket(ticketId: string) {
  return clientFetch<null>(bffPaths.supportTickets.admin.ticket(ticketId), { method: 'DELETE' });
}
