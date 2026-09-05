'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { ConversationInboxRow } from '@/features/messaging/types/messaging';
import { formatDateTime } from '@/lib/utils/format';

interface AdminConversationsPanelProps {
  initialItems: ConversationInboxRow[];
}

export function AdminConversationsPanel({ initialItems }: AdminConversationsPanelProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      {initialItems.length === 0 ? (
        <p className="text-sm text-gray-500">{t('dashboard.messages.empty')}</p>
      ) : null}
      {initialItems.map((item) => (
        <Link
          key={item.id}
          href={`/admin/messaging/conversations/${item.id}`}
          className="block rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-primary-dark">{item.listing.title}</p>
              <p className="text-sm text-gray-500">
                {item.other_participant.f_name} {item.other_participant.l_name}
              </p>
              <p className="mt-1 truncate text-sm text-gray-600">{item.last_message_preview ?? '—'}</p>
            </div>
            {item.last_message_at ? (
              <time className="shrink-0 text-xs text-gray-400">{formatDateTime(item.last_message_at)}</time>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
