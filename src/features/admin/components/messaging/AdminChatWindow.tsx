'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { fetchAdminMessages } from '@/features/admin/services/admin-messaging-client';
import type { AdminConversationDetail, BlockAuditRow, MessageAdminItem } from '@/features/messaging/types/messaging';
import { MessageBubble } from '@/features/messaging/components/MessageBubble';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { formatAdminConversationParticipants, normalizeAdminConversation, participantName } from '@/features/admin/components/messaging/admin-messaging-utils';

const PAGE_SIZE = '50';
const TOP_LOAD_THRESHOLD = 80;
const BOTTOM_STICK_THRESHOLD = 96;

interface AdminChatWindowProps {
  conversation: AdminConversationDetail;
  blocks: BlockAuditRow[];
}

function mergeMessages(prev: MessageAdminItem[], incoming: MessageAdminItem[]) {
  const seen = new Set(prev.map((item) => item.id));
  const extra = incoming.filter((item) => !seen.has(item.id));
  if (extra.length === 0) return prev;
  return [...prev, ...extra];
}

function messageMatchesSearch(message: MessageAdminItem, query: string) {
  const haystack = [
    message.content,
    message.original_content,
    message.sender ? participantName(message.sender) : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function AdminChatWindow({ conversation, blocks }: AdminChatWindowProps) {
  const { t } = useLocale();
  const normalizedConversation = normalizeAdminConversation(conversation);
  const [messages, setMessages] = useState<MessageAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);

  const normalizedSearch = messageSearch.trim().toLowerCase();

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages],
  );

  const visibleMessages = useMemo(() => {
    if (!normalizedSearch) return sortedMessages;
    return sortedMessages.filter((message) => messageMatchesSearch(message, normalizedSearch));
  }, [normalizedSearch, sortedMessages]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    stickToBottomRef.current = true;
    try {
      const response = await fetchAdminMessages(normalizedConversation.id, { limit: PAGE_SIZE });
      setMessages(response.items);
      setNextCursor(response.next_cursor ?? null);
      setHasMore(response.has_more);
    } catch {
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [normalizedConversation.id]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const el = listRef.current;
    const previousHeight = el?.scrollHeight ?? 0;
    const previousTop = el?.scrollTop ?? 0;
    try {
      const response = await fetchAdminMessages(normalizedConversation.id, { limit: PAGE_SIZE, cursor: nextCursor });
      const older = response.items;
      stickToBottomRef.current = false;
      setMessages((prev) => mergeMessages(prev, older));
      setNextCursor(response.next_cursor ?? null);
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
  }, [normalizedConversation.id, hasMore, nextCursor]);

  useLayoutEffect(() => {
    setMessageSearch('');
    void loadMessages();
  }, [normalizedConversation.id, loadMessages]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottomRef.current || normalizedSearch) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleMessages, loading, normalizedSearch]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_STICK_THRESHOLD;
    if (el.scrollTop < TOP_LOAD_THRESHOLD) {
      void loadOlderMessages();
    }
  };

  const alignRightParticipantId = normalizedConversation.buyer.id;

  return (
    <div className="flex h-full min-h-[60vh] flex-col bg-white lg:min-h-0">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="min-w-0">
          <Link
            href={`/listings/${normalizedConversation.listing.slug}`}
            className="truncate text-sm font-bold text-primary-dark hover:text-brand"
          >
            {normalizedConversation.listing.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {t('admin.messaging.participants')}: {formatAdminConversationParticipants(normalizedConversation)}
          </p>
          <p className="truncate text-xs text-gray-400">
            {normalizedConversation.seller_side === 'office'
              ? t('admin.messaging.sellerOffice')
              : t('admin.messaging.sellerIndividual')}
          </p>
        </div>
      </div>

      {blocks.length > 0 || normalizedConversation.has_block ? (
        <div className="space-y-2 border-b border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">{t('admin.messaging.blocks')}</p>
          {blocks.length > 0 ? (
            <ul className="space-y-1 text-xs text-amber-800">
              {blocks.map((block) => (
                <li key={block.id}>
                  {participantName(block.blocker)} → {participantName(block.blocked)} (
                  {formatDateTime(block.created_at)})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-800">{t('admin.messaging.blocked')}</p>
          )}
        </div>
      ) : null}

      <div className="border-b border-gray-200 px-4 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
            placeholder={t('admin.messaging.messageSearch')}
            className="w-full rounded-xl border border-gray-200 py-2 ps-9 pe-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loadingOlder ? (
          <p className="text-center text-xs text-gray-400">{t('dashboard.messages.loadingOlder')}</p>
        ) : null}
        {loading ? <p className="text-sm text-gray-500">...</p> : null}
        {!loading && normalizedSearch && visibleMessages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">{t('admin.messaging.noMessageResults')}</p>
        ) : null}
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={false}
            adminMode
            alignRightParticipantId={alignRightParticipantId}
            senderLabel={message.sender ? participantName(message.sender) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
