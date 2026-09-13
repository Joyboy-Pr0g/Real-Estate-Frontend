'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  blockUser,
  deleteMessage,
  fetchConversation,
  fetchMessages,
  markConversationRead,
  reportConversation,
  sendListingImageMessage,
  sendTextMessage,
  unblockUser,
} from '@/features/messaging/services/messaging-client';
import type { BlockState, ConversationDetail, MessageItem } from '@/features/messaging/types/messaging';
import { MessageBubble } from '@/features/messaging/components/MessageBubble';
import { ChatComposer } from '@/features/messaging/components/ChatComposer';
import { useMessagingSocket } from '@/features/messaging/providers/MessagingSocketProvider';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/api/client';
import { AuthUser } from '@/features/auth/types/user';
import { toast } from '@/components/ui/toaster';

const PAGE_SIZE = '50';
const TOP_LOAD_THRESHOLD = 80;
const BOTTOM_STICK_THRESHOLD = 96;

interface ChatWindowProps {
  conversation: ConversationDetail;
  user: AuthUser;
}

function mergeMessages(prev: MessageItem[], incoming: MessageItem[]) {
  const seen = new Set(prev.map((item) => item.id));
  const extra = incoming.filter((item) => !seen.has(item.id));
  if (extra.length === 0) return prev;
  return [...prev, ...extra];
}

export function ChatWindow({ conversation, user }: ChatWindowProps) {
  const { t } = useLocale();
  const { socket, joinConversation, leaveConversation, setActiveConversation } = useMessagingSocket();
  const [blockState, setBlockState] = useState<BlockState>(conversation.block_state);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);

  const blocked = blockState.blocked_me || blockState.blocked_by_me;
  const composerDisabled = blocked;

  const refreshBlockState = useCallback(async () => {
    const response = await fetchConversation(conversation.id);
    if (response.data?.block_state) {
      setBlockState(response.data.block_state);
    }
  }, [conversation.id]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages],
  );

  const appendMessage = useCallback((message: MessageItem) => {
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
      const response = await fetchMessages(conversation.id, { limit: PAGE_SIZE });
      setMessages(response.data ?? []);
      setNextCursor(response.next_cursor ?? null);
      setHasMore(Boolean(response.has_more));
      await markConversationRead(conversation.id);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const el = listRef.current;
    const previousHeight = el?.scrollHeight ?? 0;
    const previousTop = el?.scrollTop ?? 0;
    try {
      const response = await fetchMessages(conversation.id, { limit: PAGE_SIZE, cursor: nextCursor });
      const older = response.data ?? [];
      stickToBottomRef.current = false;
      setMessages((prev) => mergeMessages(prev, older));
      setNextCursor(response.next_cursor ?? null);
      setHasMore(Boolean(response.has_more));
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
  }, [conversation.id, hasMore, nextCursor]);

  useEffect(() => {
    setActiveConversation(conversation.id);
    setBlockState(conversation.block_state);
    void loadMessages();
    joinConversation(conversation.id);
    return () => {
      setActiveConversation(null);
      leaveConversation(conversation.id);
    };
  }, [conversation.id, joinConversation, leaveConversation, loadMessages, setActiveConversation]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [sortedMessages, loading]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (message: MessageItem) => {
      if (message.id) {
        appendMessage(message);
        void markConversationRead(conversation.id);
      }
    };

    const onDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? { ...item, deleted: true, content: null, media: null, placeholder: t('dashboard.messages.deleted') }
            : item,
        ),
      );
    };

    const onBlocked = ({ conversationId }: { conversationId: string }) => {
      if (conversationId !== conversation.id) return;
      void refreshBlockState();
    };

    const onUnblocked = ({ conversationId }: { conversationId: string }) => {
      if (conversationId !== conversation.id) return;
      void refreshBlockState();
    };

    socket.on('message:new', onNew);
    socket.on('message:deleted', onDeleted);
    socket.on('conversation:blocked', onBlocked);
    socket.on('conversation:unblocked', onUnblocked);
    return () => {
      socket.off('message:new', onNew);
      socket.off('message:deleted', onDeleted);
      socket.off('conversation:blocked', onBlocked);
      socket.off('conversation:unblocked', onUnblocked);
    };
  }, [socket, conversation.id, t, appendMessage, refreshBlockState]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_STICK_THRESHOLD;
    if (el.scrollTop < TOP_LOAD_THRESHOLD) {
      void loadOlderMessages();
    }
  };

  const handleBlockToggle = async () => {
    try {
      if (blockState.blocked_by_me) {
        await unblockUser(conversation.id);
        setBlockState((prev) => ({ ...prev, blocked_by_me: false }));
      } else {
        await blockUser(conversation.id);
        setBlockState((prev) => ({ ...prev, blocked_by_me: true }));
      }
      await refreshBlockState();
    } catch (err) {
      toast.error(getErrorMessage(err));
      await refreshBlockState();
    }
  };

  const handleReport = async () => {
    try {
      await reportConversation(conversation.id, { reason: reportReason });
      setReportOpen(false);
      toast.success(t('dashboard.messages.reportSent'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(conversation.id, messageId);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? { ...item, deleted: true, content: null, media: null, placeholder: t('dashboard.messages.deleted') }
            : item,
        ),
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex h-full min-h-[60vh] flex-col bg-white lg:min-h-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="min-w-0">
          <Link href={`/listings/${conversation.listing.slug}`} className="truncate text-sm font-bold text-primary-dark hover:text-brand">
            {conversation.listing.title}
          </Link>
          <p className="truncate text-xs text-gray-500">
            {conversation.other_participant.f_name} {conversation.other_participant.l_name}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void handleBlockToggle()} className="text-xs text-gray-600 hover:text-primary-dark cursor-pointer">
            {blockState.blocked_by_me ? t('dashboard.messages.unblock') : t('dashboard.messages.block')}
          </button>
          <button type="button" onClick={() => setReportOpen(true)} className="text-xs text-red-600 hover:text-red-700 cursor-pointer">
            {t('dashboard.messages.report')}
          </button>
        </div>
      </div>

      {blocked ? (
        <div className="bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {blockState.blocked_by_me
            ? t('dashboard.messages.blockedByYou')
            : t('dashboard.messages.blockedBanner')}
        </div>
      ) : null}

      <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loadingOlder ? <p className="text-center text-xs text-gray-400">{t('dashboard.messages.loadingOlder')}</p> : null}
        {loading ? <p className="text-sm text-gray-500">...</p> : null}
        {sortedMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.sender_id === user.id}
            onDelete={
              message.sender_id === user.id && !message.deleted
                ? () => void handleDelete(message.id)
                : undefined
            }
          />
        ))}
      </div>

      <ChatComposer
        disabled={composerDisabled}
        listingId={conversation.listing.id}
        onSendText={async (content) => {
          const response = await sendTextMessage(conversation.id, content);
          if (response.data) appendMessage(response.data);
        }}
        onSendImage={async (photo) => {
          const response = await sendListingImageMessage(conversation.id, photo);
          if (response.data) appendMessage(response.data);
        }}
      />

      {reportOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-primary-dark">{t('dashboard.messages.report')}</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="spam">{t('dashboard.messages.reason.spam')}</option>
              <option value="harassment">{t('dashboard.messages.reason.harassment')}</option>
              <option value="scam">{t('dashboard.messages.reason.scam')}</option>
              <option value="other">{t('dashboard.messages.reason.other')}</option>
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setReportOpen(false)} className="rounded-xl px-4 py-2 text-sm text-gray-600">
                {t('admin.close')}
              </button>
              <button type="button" onClick={() => void handleReport()} className="rounded-xl bg-brand px-4 py-2 text-sm text-white">
                {t('dashboard.messages.send')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
