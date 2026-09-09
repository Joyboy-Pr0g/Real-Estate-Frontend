import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { ConversationInboxRow } from '@/features/messaging/types/messaging';
import { formatDateTime } from '@/lib/utils/format';
import { getServerTranslations } from '@/lib/i18n/server';

interface DashboardConversationPreviewProps {
  conversations: ConversationInboxRow[];
}

export async function DashboardConversationPreview({ conversations }: DashboardConversationPreviewProps) {
  const { t } = await getServerTranslations();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-var(--shadow-soft)">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-primary-dark">{t('dashboard.home.recentConversations')}</h2>
        </div>
        <Link
          href="/dashboard/messages"
          className="text-xs font-semibold text-brand-dark hover:text-brand"
        >
          {t('dashboard.home.viewAllMessages')}
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-gray-500">{t('dashboard.messages.empty')}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {conversations.map((item) => {
            const name = `${item.other_participant.f_name} ${item.other_participant.l_name}`.trim();
            return (
              <Link
                key={item.id}
                href={`/dashboard/messages/${item.id}`}
                className="flex gap-3 px-5 py-4 transition-colors hover:bg-gray-50/80"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {item.listing.main_image_url ? (
                    <Image
                      src={item.listing.main_image_url}
                      alt={item.listing.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-primary-dark">{item.listing.title}</p>
                    {item.last_message_at ? (
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {formatDateTime(item.last_message_at)}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-gray-500">{name}</p>
                  <p className="mt-1 truncate text-sm text-gray-600">{item.last_message_preview ?? '—'}</p>
                </div>
                {item.unread_count > 0 ? (
                  <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                    {item.unread_count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
