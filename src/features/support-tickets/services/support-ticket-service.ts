import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import type {
  CanCreateTicketResult,
  CursorPage,
  SupportTicketDetail,
  SupportTicketInboxRow,
  SupportTicketMessageItem,
} from '@/features/support-tickets/types/support-ticket';

function unwrapList<T>(response: { data?: T[]; next_cursor?: string | null; has_more?: boolean }): CursorPage<T> {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function getCanCreateTicket(): Promise<CanCreateTicketResult> {
  const token = await getAuthToken();
  const response = await serverFetch<CanCreateTicketResult>(backendPaths.supportTickets.canCreate, { token });
  return response.data ?? { allowed: false, reason: 'not_eligible' };
}

export async function getSupportTickets(params: Record<string, string> = {}): Promise<CursorPage<SupportTicketInboxRow>> {
  const token = await getAuthToken();
  const response = await serverFetch<SupportTicketInboxRow[]>(backendPaths.supportTickets.tickets, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicketDetail | null> {
  const token = await getAuthToken();
  const response = await serverFetch<SupportTicketDetail>(backendPaths.supportTickets.ticket(ticketId), { token });
  return response.data ?? null;
}

export async function getSupportTicketMessages(
  ticketId: string,
  params: Record<string, string> = {},
): Promise<CursorPage<SupportTicketMessageItem>> {
  const token = await getAuthToken();
  const response = await serverFetch<SupportTicketMessageItem[]>(backendPaths.supportTickets.messages(ticketId), {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminSupportTickets(params: Record<string, string> = {}): Promise<CursorPage<SupportTicketInboxRow>> {
  const token = await getAuthToken();
  const response = await serverFetch<SupportTicketInboxRow[]>(backendPaths.supportTickets.admin.tickets, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminSupportTicket(ticketId: string): Promise<SupportTicketDetail | null> {
  const token = await getAuthToken();
  const response = await serverFetch<SupportTicketDetail>(backendPaths.supportTickets.admin.ticket(ticketId), { token });
  return response.data ?? null;
}
