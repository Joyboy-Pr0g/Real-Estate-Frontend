import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import type {
  AdminConversationDetail,
  AdminConversationInboxRow,
  BlockAuditRow,
  ConversationDetail,
  ConversationInboxRow,
  ConversationReportItem,
  CursorPage,
  MessageAdminItem,
  MessageItem,
} from '@/features/messaging/types/messaging';

function unwrapList<T>(response: { data?: T[]; next_cursor?: string | null; has_more?: boolean }): CursorPage<T> {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function getConversations(params: Record<string, string> = {}): Promise<CursorPage<ConversationInboxRow>> {
  const token = await getAuthToken();
  const response = await serverFetch<ConversationInboxRow[]>(backendPaths.messaging.conversations, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  const token = await getAuthToken();
  const response = await serverFetch<ConversationDetail>(backendPaths.messaging.conversation(conversationId), { token });
  return response.data ?? null;
}

export async function getMessages(conversationId: string, params: Record<string, string> = {}): Promise<CursorPage<MessageItem>> {
  const token = await getAuthToken();
  const response = await serverFetch<MessageItem[]>(backendPaths.messaging.messages(conversationId), {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getUnreadCount(): Promise<number> {
  const token = await getAuthToken();
  const response = await serverFetch<{ count: number }>(backendPaths.messaging.unreadCount, { token });
  return response.data?.count ?? 0;
}

export async function getAdminConversations(params: Record<string, string> = {}): Promise<CursorPage<AdminConversationInboxRow>> {
  const token = await getAuthToken();
  const response = await serverFetch<AdminConversationInboxRow[]>(backendPaths.messaging.admin.conversations, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminConversation(conversationId: string): Promise<AdminConversationDetail | null> {
  const token = await getAuthToken();
  try {
    const response = await serverFetch<AdminConversationDetail>(backendPaths.messaging.admin.conversation(conversationId), {
      token,
    });
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getAdminMessages(conversationId: string, params: Record<string, string> = {}): Promise<CursorPage<MessageAdminItem>> {
  const token = await getAuthToken();
  const response = await serverFetch<MessageAdminItem[]>(backendPaths.messaging.admin.messages(conversationId), {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminBlocks(conversationId: string): Promise<BlockAuditRow[]> {
  const token = await getAuthToken();
  const response = await serverFetch<BlockAuditRow[]>(backendPaths.messaging.admin.blocks(conversationId), { token });
  return response.data ?? [];
}

export async function getMyConversationReports(params: Record<string, string> = {}): Promise<CursorPage<ConversationReportItem>> {
  const token = await getAuthToken();
  const response = await serverFetch<ConversationReportItem[]>(backendPaths.messaging.myReports, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminReports(params: Record<string, string> = {}): Promise<CursorPage<ConversationReportItem>> {
  const token = await getAuthToken();
  const response = await serverFetch<ConversationReportItem[]>(backendPaths.messaging.admin.reports, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}
