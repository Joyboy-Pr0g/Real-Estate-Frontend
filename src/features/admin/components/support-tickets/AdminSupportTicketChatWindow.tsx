'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import {
  deleteAdminSupportTicket,
  fetchAdminSupportTicketMessages,
  sendAdminSupportTicketImage,
  sendAdminSupportTicketText,
  updateAdminSupportTicketStatus,
} from '@/features/admin/services/admin-support-tickets-client';
import type { SupportTicketDetail, SupportTicketMessageItem, SupportTicketStatus } from '@/features/support-tickets/types/support-ticket';
import { MessageBubble } from '@/features/messaging/components/MessageBubble';
import { SupportTicketComposer } from '@/features/support-tickets/components/SupportTicketComposer';
import { formatTicketStatusKey, requesterName, toMessageBubbleItem } from '@/features/support-tickets/components/support-ticket-utils';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { toast } from '@/components/ui/toaster';

const PAGE_SIZE = '50';
const TOP_LOAD_THRESHOLD = 80;
const BOTTOM_STICK_THRESHOLD = 96;
const STATUSES: SupportTicketStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];

interface AdminSupportTicketChatWindowProps {
  ticket: SupportTicketDetail;
  adminUserId: string;
  embedded?: boolean;
  onClose?: () => void;
  onDeleted: () => void;
  onStatusUpdated: (ticket: SupportTicketDetail) => void;
}

function mergeMessages(prev: SupportTicketMessageItem[], incoming: SupportTicketMessageItem[]) {
  const seen = new Set(prev.map((item) => item.id));
  const extra = incoming.filter((item) => !seen.has(item.id));
  if (extra.length === 0) return prev;
  return [...prev, ...extra];
}

export function AdminSupportTicketChatWindow({
  ticket,
  adminUserId,
  embedded = false,
  onClose,
  onDeleted,
  onStatusUpdated,
}: AdminSupportTicketChatWindowProps) {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('support_tickets.edit');
  const router = useRouter();
  const [messages, setMessages] = useState<SupportTicketMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<SupportTicketStatus>(ticket.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);

  const composerDisabled = status === 'closed' || !canEdit;

  useEffect(() => {
    setStatus(ticket.status);
  }, [ticket.status]);

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
      const response = await fetchAdminSupportTicketMessages(ticket.id, { limit: PAGE_SIZE });
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
      const response = await fetchAdminSupportTicketMessages(ticket.id, { limit: PAGE_SIZE, cursor: nextCursor });
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

  const handleStatusChange = async (nextStatus: SupportTicketStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await updateAdminSupportTicketStatus(ticket.id, nextStatus);
      if (response.data) {
        setStatus(response.data.status);
        onStatusUpdated(response.data);
        toast.success(t('admin.supportTickets.statusUpdated'));
        router.refresh();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminSupportTicket(ticket.id);
      toast.success(t('admin.supportTickets.deleted'));
      setDeleteOpen(false);
      onDeleted();
      onClose?.();
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={embedded ? 'flex h-full flex-col bg-white' : 'flex h-full min-h-[60vh] flex-col bg-white lg:min-h-0'}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div className="min-w-0">
          {!embedded ? (
            <h2 className="truncate text-sm font-bold text-primary-dark">{ticket.subject}</h2>
          ) : null}
          {ticket.requester ? (
            <p className="truncate text-xs text-gray-500">
              {requesterName(ticket.requester)} · {ticket.requester.email}
            </p>
          ) : null}
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => void handleStatusChange(e.target.value as SupportTicketStatus)}
              disabled={updatingStatus}
              className="h-9 rounded-xl border border-gray-200 px-2 text-xs outline-none focus:border-brand"
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(formatTicketStatusKey(item))}
                </option>
              ))}
            </select>
            <Button type="button" variant="dangerOutline" size="sm" onClick={() => setDeleteOpen(true)} className="rounded-xl">
              <Trash2 className="h-4 w-4" />
              {t('admin.delete')}
            </Button>
          </div>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {t(formatTicketStatusKey(status))}
          </span>
        )}
      </div>

      {composerDisabled ? (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600">{t('dashboard.supportTickets.closedHint')}</div>
      ) : null}

      <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loadingOlder ? <p className="text-center text-xs text-gray-400">{t('dashboard.messages.loadingOlder')}</p> : null}
        {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /> : null}
        {sortedMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={toMessageBubbleItem(message)}
            isMine={message.sender_id === adminUserId || Boolean(message.is_admin)}
            adminMode
            senderLabel={
              message.is_admin
                ? t('dashboard.supportTickets.adminLabel')
                : message.sender
                  ? requesterName(message.sender)
                  : undefined
            }
          />
        ))}
      </div>

      <SupportTicketComposer
        disabled={composerDisabled}
        onSendText={async (content) => {
          const response = await sendAdminSupportTicketText(ticket.id, content);
          if (response.data) appendMessage(response.data);
        }}
        onSendImage={async (file) => {
          const response = await sendAdminSupportTicketImage(ticket.id, file);
          if (response.data) appendMessage(response.data);
        }}
      />

      <ConfirmModal
        open={deleteOpen}
        title={t('admin.supportTickets.deleteTitle')}
        description={t('admin.supportTickets.deleteDescription')}
        confirmText={t('admin.delete')}
        cancelText={t('admin.cancel')}
        loading={deleting}
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
