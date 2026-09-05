'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import type { BlockAuditRow, ConversationInboxRow, MessageAdminItem } from '@/features/messaging/types/messaging';

interface AdminConversationDetailPanelProps {
  conversation: ConversationInboxRow;
  messages: MessageAdminItem[];
  blocks: BlockAuditRow[];
}

export function AdminConversationDetailPanel({
  conversation,
  messages,
  blocks,
}: AdminConversationDetailPanelProps) {
  const { t } = useLocale();

  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/messaging/conversations" className="text-sm text-brand hover:underline">
          ← {t('admin.messaging.conversations')}
        </Link>
        <h1 className="mt-2 text-xl font-bold text-primary-dark">{conversation.listing.title}</h1>
        <p className="text-sm text-gray-500">
          {conversation.other_participant.f_name} {conversation.other_participant.l_name}
        </p>
      </div>

      {blocks.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-bold text-amber-900">{t('admin.messaging.blocks')}</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {blocks.map((block) => (
              <li key={block.id}>
                {block.blocker.f_name} → {block.blocked.f_name} ({formatDateTime(block.created_at)})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        {sorted.map((message) => (
          <div key={message.id} className="rounded-xl bg-gray-50 p-3 text-sm">
            {message.deleted ? (
              <div>
                <p className="font-medium text-gray-500">{t('admin.messaging.deletedMessage')}</p>
                <p className="mt-1 text-gray-700">{message.original_content ?? '—'}</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-primary-dark">{message.content}</p>
            )}
            <time className="mt-1 block text-xs text-gray-400">{formatDateTime(message.created_at)}</time>
          </div>
        ))}
      </div>
    </div>
  );
}
