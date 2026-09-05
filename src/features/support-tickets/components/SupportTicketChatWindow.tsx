'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  fetchSupportTicketMessages,
  sendSupportTicketImage,
  sendSupportTicketText,
} from '@/features/support-tickets/services/support-ticket-client';
import type { SupportTicketDetail, SupportTicketMessageItem } from '@/features/support-tickets/types/support-ticket';
import { MessageBubble } from '@/features/messaging/components/MessageBubble';
import { SupportTicketComposer } from '@/features/support-tickets/components/SupportTicketComposer';
import { toMessageBubbleItem, formatTicketStatusKey } from '@/features/support-tickets/components/support-ticket-utils';
import { useLocale } from '@/lib/i18n/locale-provider';
import { AuthUser } from '@/features/auth/types/user';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';

const PAGE_SIZE = '50';
const TOP_LOAD_THRESHOLD = 80;
const BOTTOM_STICK_THRESHOLD = 96;

interface SupportTicketChatWindowProps {
  ticket: SupportTicketDetail;
  user: AuthUser;
  embedded?: boolean;
}

function mergeMessages(prev: SupportTicketMessageItem[], incoming: SupportTicketMessageItem[]) {
  const seen = new Set(prev.map((item) => item.id));
  const extra = incoming.filter((item) => !seen.has(item.id));
  if (extra.length === 0) return prev;
  return [...prev, ...extra];
}

export function SupportTicketChatWindow({ ticket, user, embedded = false }: SupportTicketChatWindowProps) {
  const { t } = useLocale();
  const [messages, setMessages] = useState<SupportTicketMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);

  const composerDisabled = ticket.status === 'closed';

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages],
  );

  const appendMessage = useCallback((message: SupportTicketMessageItem) => {
    stickToBottomRef.current = true;
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [message, ...prev];
    });
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    stickToBottomRef.current = true;
    try {
      const response = await fetchSupportTicketMessages(ticket.id, { limit: PAGE_SIZE });
      setMessages(response.items);
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } finally {
      setLoading(false);
    }
  }, [ticket.id]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const el = listRef.current;
    const previousHeight = el?.scrollHeight ?? 0;
    const previousTop = el?.scrollTop ?? 0;
    try {
      const response = await fetchSupportTicketMessages(ticket.id, { limit: PAGE_SIZE, cursor: nextCursor });
      stickToBottomRef.current = false;
      setMessages((prev) => mergeMessages(prev, response.items));
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!el) return;
          el.scrollTop = el.scrollHeight - previousHeight + previousTop;
        });
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [hasMore, nextCursor, ticket.id]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [sortedMessages.length, loading]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom <= BOTTOM_STICK_THRESHOLD;
    if (el.scrollTop < TOP_LOAD_THRESHOLD) {
      void loadOlderMessages();
    }
  };

  return (
    <div className={embedded ? 'flex h-full flex-col bg-white' : 'flex h-full min-h-[60vh] flex-col bg-white lg:min-h-0'}>
      {!embedded ? (
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="truncate text-sm font-bold text-primary-dark">{ticket.subject}</h2>
          <p className="text-xs text-gray-500">{t(formatTicketStatusKey(ticket.status))}</p>
        </div>
      ) : null}

      {composerDisabled ? (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600">{t('dashboard.supportTickets.closedHint')}</div>
      ) : null}

      <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loadingOlder ? <p className="text-center text-xs text-gray-400">{t('dashboard.messages.loadingOlder')}</p> : null}
        {loading ? <p className="text-sm text-gray-500">...</p> : null}
        {sortedMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={toMessageBubbleItem(message)}
            isMine={message.sender_id === user.id}
            senderLabel={message.is_admin ? t('dashboard.supportTickets.adminLabel') : undefined}
          />
        ))}
      </div>

      <SupportTicketComposer
        disabled={composerDisabled}
        onSendText={async (content) => {
          try {
            const response = await sendSupportTicketText(ticket.id, content);
            if (response.data) appendMessage(response.data);
          } catch (err) {
            toast.error(getErrorMessage(err));
            throw err;
          }
        }}
        onSendImage={async (file) => {
          try {
            const response = await sendSupportTicketImage(ticket.id, file);
            if (response.data) appendMessage(response.data);
          } catch (err) {
            toast.error(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
