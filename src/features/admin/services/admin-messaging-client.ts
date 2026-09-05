'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type {
  AdminConversationDetail,
  AdminConversationInboxRow,
  BlockAuditRow,
  ConversationReportItem,
  MessageAdminItem,
} from '@/features/messaging/types/messaging';

export async function fetchAdminConversations(params: Record<string, string> = {}) {
  const response = await clientFetch<AdminConversationInboxRow[]>(bffPaths.messaging.admin.conversations, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function fetchAdminMessages(conversationId: string, params: Record<string, string> = {}) {
  const response = await clientFetch<MessageAdminItem[]>(bffPaths.messaging.admin.messages(conversationId), {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function fetchAdminConversation(conversationId: string) {
  const response = await clientFetch<AdminConversationDetail>(bffPaths.messaging.admin.conversation(conversationId));
  return response.data ?? null;
}

export async function fetchAdminBlocks(conversationId: string) {
  const response = await clientFetch<BlockAuditRow[]>(bffPaths.messaging.admin.blocks(conversationId));
  return response.data ?? [];
}

export async function fetchAdminConversationReports(params: Record<string, string> = {}) {
  const response = await clientFetch<ConversationReportItem[]>(bffPaths.messaging.admin.reports, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function updateAdminConversationReport(
  reportId: string,
  body: { status: string; admin_notes?: string | null },
) {
  return clientFetch<ConversationReportItem>(bffPaths.messaging.admin.reportById(reportId), {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminConversation(conversationId: string) {
  return clientFetch<null>(bffPaths.messaging.admin.conversation(conversationId), {
    method: 'DELETE',
  });
}
