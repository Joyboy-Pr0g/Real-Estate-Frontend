'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { toast } from '@/components/ui/toaster';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { MessagesInboxPanel } from '@/features/messaging/components/MessagesInboxPanel';
import { AdminChatWindow } from '@/features/admin/components/messaging/AdminChatWindow';
import { deleteAdminConversation, fetchAdminConversations } from '@/features/admin/services/admin-messaging-client';
import { formatAdminConversationParticipants, normalizeAdminConversation } from '@/features/admin/components/messaging/admin-messaging-utils';
import type { AdminConversationDetail, AdminConversationInboxRow, BlockAuditRow } from '@/features/messaging/types/messaging';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface AdminMessagesPageViewProps {
  initialItems: AdminConversationInboxRow[];
  activeConversation?: AdminConversationDetail | null;
  blocks?: BlockAuditRow[];
}

export function AdminMessagesPageView({
  initialItems,
  activeConversation,
  blocks = [],
}: AdminMessagesPageViewProps) {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canEditMessaging = hasPermission('messaging.edit');
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(true);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const loadConversations = useCallback((nextSearch: string, nextBlockedOnly: boolean) => {
    startTransition(async () => {
      const params: Record<string, string> = { limit: '50' };
      if (nextSearch.trim()) params.search = nextSearch.trim();
      if (nextBlockedOnly) params.has_block = 'true';

      const response = await fetchAdminConversations(params);
      setItems(response.items);
    });
  }, []);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      if (!search && !blockedOnly) return;
    }

    const timer = window.setTimeout(() => {
      loadConversations(search, blockedOnly);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, blockedOnly, loadConversations]);

  const confirmDeleteConversation = async () => {
    if (!deleteTargetId) return;

    const conversationId = deleteTargetId;
    setDeletingConversationId(conversationId);
    try {
      await deleteAdminConversation(conversationId);
      setItems((prev) => prev.filter((item) => item.id !== conversationId));
      toast.success(t('admin.messaging.deleteConversationSuccess'));
      if (activeConversation?.id === conversationId) {
        router.push('/admin/messaging/conversations');
      }
      setDeleteTargetId(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingConversationId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col lg:h-[calc(100vh-1rem)]">
      <div className="border-b border-gray-200 px-4 py-4 lg:px-6">
        <h1 className="text-xl font-bold text-primary-dark">{t('admin.messaging.conversations')}</h1>
        <p className="text-sm text-gray-500">{t('admin.messaging.hint')}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-b-0 lg:border-e">
          <div className="space-y-2 border-b border-gray-100 p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.messaging.searchPlaceholder')}
                className="w-full rounded-xl border border-gray-200 py-2 ps-9 pe-3 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={blockedOnly}
                onChange={(e) => setBlockedOnly(e.target.checked)}
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              {t('admin.messaging.filterBlocked')}
            </label>
            {isPending ? <p className="text-xs text-gray-400">{t('dashboard.messages.loadingOlder')}</p> : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">{t('dashboard.messages.empty')}</p>
            ) : (
              <MessagesInboxPanel
                items={items}
                activeId={activeConversation?.id}
                basePath="/admin/messaging/conversations"
                getSubtitle={(item) =>
                  formatAdminConversationParticipants(
                    normalizeAdminConversation(item as AdminConversationInboxRow),
                  )
                }
                showBlockBadge={(item) => Boolean((item as AdminConversationInboxRow).has_block)}
                onDeleteConversation={canEditMessaging ? setDeleteTargetId : undefined}
                deletingConversationId={deletingConversationId}
              />
            )}
          </div>
        </aside>

        <section className="min-h-[50vh] lg:min-h-0">
          {activeConversation ? (
            <AdminChatWindow
              conversation={normalizeAdminConversation(activeConversation)}
              blocks={blocks}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
              {t('admin.messaging.emptyChat')}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={deleteTargetId !== null}
        title={t('admin.messaging.deleteConversation')}
        description={t('admin.messaging.deleteConversationConfirm')}
        confirmText={t('admin.delete')}
        cancelText={t('admin.cancel')}
        loading={deletingConversationId !== null}
        danger
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => void confirmDeleteConversation()}
      />
    </div>
  );
}
