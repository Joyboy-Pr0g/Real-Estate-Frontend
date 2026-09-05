'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type {
  ConversationDetail,
  ConversationInboxRow,
  ConversationReportItem,
  CursorPage,
  MessageItem,
  SocketNotificationPayload,
} from '@/features/messaging/types/messaging';

export async function createConversation(listingId: string) {
  return clientFetch<ConversationDetail>(bffPaths.messaging.conversations, {
    method: 'POST',
    body: { listing_id: listingId },
  });
}

export async function fetchConversations(params: Record<string, string> = {}) {
  return clientFetch<ConversationInboxRow[]>(bffPaths.messaging.conversations, { searchParams: params });
}

export async function fetchConversation(conversationId: string) {
  return clientFetch<ConversationDetail>(bffPaths.messaging.conversation(conversationId));
}

export async function fetchMessages(conversationId: string, params: Record<string, string> = {}) {
  return clientFetch<MessageItem[]>(bffPaths.messaging.messages(conversationId), { searchParams: params });
}

export async function sendTextMessage(conversationId: string, content: string) {
  return clientFetch<MessageItem>(bffPaths.messaging.messages(conversationId), {
    method: 'POST',
    body: { content },
  });
}

export async function sendListingImageMessage(
  conversationId: string,
  body: { url: string; public_id: string },
) {
  return clientFetch<MessageItem>(bffPaths.messaging.listingImage(conversationId), {
    method: 'POST',
    body,
  });
}

export async function deleteMessage(conversationId: string, messageId: string) {
  return clientFetch<null>(bffPaths.messaging.message(conversationId, messageId), { method: 'DELETE' });
}

export async function blockUser(conversationId: string) {
  return clientFetch<null>(bffPaths.messaging.block(conversationId), { method: 'POST' });
}

export async function unblockUser(conversationId: string) {
  return clientFetch<null>(bffPaths.messaging.block(conversationId), { method: 'DELETE' });
}

export async function reportConversation(conversationId: string, body: { reason: string; description?: string }) {
  return clientFetch<null>(bffPaths.messaging.report(conversationId), { method: 'POST', body });
}

export async function markConversationRead(conversationId: string) {
  return clientFetch<null>(bffPaths.messaging.read(conversationId), { method: 'PATCH' });
}

export async function fetchUnreadCount() {
  return clientFetch<{ count: number }>(bffPaths.messaging.unreadCount);
}

export async function fetchSocketTicket() {
  return clientFetch<{ ticket: string; expires_in: number }>(bffPaths.messaging.socketTicket);
}

export async function fetchMyConversationReports(params: Record<string, string> = {}) {
  const response = await clientFetch<ConversationReportItem[]>(bffPaths.messaging.myReports, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function registerDeviceToken(token: string, platform = 'web') {
  return clientFetch<null>(bffPaths.messaging.deviceTokens, {
    method: 'POST',
    body: { token, platform },
  });
}

export type { SocketNotificationPayload };
