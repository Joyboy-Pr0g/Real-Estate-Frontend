'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type {
  CanCreateTicketResult,
  CursorPage,
  SupportTicketDetail,
  SupportTicketInboxRow,
  SupportTicketMessageItem,
} from '@/features/support-tickets/types/support-ticket';

export async function fetchCanCreateTicket() {
  return clientFetch<CanCreateTicketResult>(bffPaths.supportTickets.canCreate);
}

export async function createSupportTicket(body: { subject: string; content?: string }) {
  return clientFetch<SupportTicketDetail>(bffPaths.supportTickets.tickets, {
    method: 'POST',
    body,
  });
}

export async function fetchSupportTickets(params: Record<string, string> = {}) {
  const response = await clientFetch<SupportTicketInboxRow[]>(bffPaths.supportTickets.tickets, { searchParams: params });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  } satisfies CursorPage<SupportTicketInboxRow>;
}

export async function fetchSupportTicket(ticketId: string) {
  return clientFetch<SupportTicketDetail>(bffPaths.supportTickets.ticket(ticketId));
}

export async function fetchSupportTicketMessages(ticketId: string, params: Record<string, string> = {}) {
  const response = await clientFetch<SupportTicketMessageItem[]>(bffPaths.supportTickets.messages(ticketId), {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  } satisfies CursorPage<SupportTicketMessageItem>;
}

export async function sendSupportTicketText(ticketId: string, content: string) {
  return clientFetch<SupportTicketMessageItem>(bffPaths.supportTickets.messages(ticketId), {
    method: 'POST',
    body: { content },
  });
}

export async function sendSupportTicketImage(ticketId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message_type', 'image');
  return clientFetch<SupportTicketMessageItem>(bffPaths.supportTickets.messagesMedia(ticketId), {
    method: 'POST',
    body: formData,
  });
}
