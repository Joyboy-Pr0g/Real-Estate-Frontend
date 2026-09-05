'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ConversationInboxRow } from '@/features/messaging/types/messaging';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MessagesInboxPanelProps {
  items: ConversationInboxRow[];
  activeId?: string;
  basePath?: string;
  getSubtitle?: (item: ConversationInboxRow) => string;
  showBlockBadge?: (item: ConversationInboxRow) => boolean;
  onDeleteConversation?: (conversationId: string) => void;
  deletingConversationId?: string | null;
}

export function MessagesInboxPanel({
  items,
  activeId,
  basePath = '/dashboard/messages',
  getSubtitle,
  showBlockBadge,
  onDeleteConversation,
  deletingConversationId,
}: MessagesInboxPanelProps) {
  const { t } = useLocale();

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto">
      {items.map((item) => {
        const active = item.id === activeId;
        const name = getSubtitle
          ? getSubtitle(item)
          : `${item.other_participant.f_name} ${item.other_participant.l_name}`.trim();
        const blocked = showBlockBadge?.(item) ?? false;
        const deleting = deletingConversationId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-stretch gap-1 px-2 py-1 transition-colors hover:bg-gray-50',
              active && 'bg-brand-muted/60',
            )}
          >
            <Link href={`${basePath}/${item.id}`} className="flex min-w-0 flex-1 gap-3 px-2 py-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {item.listing.main_image_url ? (
                  <Image src={item.listing.main_image_url} alt={item.listing.title} fill className="object-cover" sizes="48px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-primary-dark">{item.listing.title}</p>
                  {item.last_message_at ? (
                    <span className="shrink-0 text-[11px] text-gray-400">{formatDateTime(item.last_message_at)}</span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-gray-500">{name}</p>
                <p className="mt-1 truncate text-sm text-gray-600">{item.last_message_preview ?? '—'}</p>
                {blocked ? (
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                    {t('admin.messaging.blocked')}
                  </span>
                ) : null}
              </div>
              {item.unread_count > 0 ? (
                <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {item.unread_count}
                </span>
              ) : null}
            </Link>
            {onDeleteConversation ? (
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDeleteConversation(item.id)}
                className="my-2 flex shrink-0 items-center justify-center rounded-xl px-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={t('admin.messaging.deleteConversation')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
