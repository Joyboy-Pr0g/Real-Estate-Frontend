'use client';

import Link from 'next/link';
import { MessagesInboxPanel } from '@/features/messaging/components/MessagesInboxPanel';
import { ChatWindow } from '@/features/messaging/components/ChatWindow';
import { MyConversationReportsList } from '@/features/messaging/components/MyConversationReportsList';
import type { ConversationDetail, ConversationInboxRow, ConversationReportItem } from '@/features/messaging/types/messaging';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { AuthUser } from '@/features/auth/types/user';

interface MessagesPageViewProps {
  user: AuthUser;
  inboxItems: ConversationInboxRow[];
  activeConversation?: ConversationDetail | null;
  activeSection?: 'conversations' | 'reports';
  reportItems?: ConversationReportItem[];
  reportCursor?: string | null;
  reportHasMore?: boolean;
}

export function MessagesPageView({
  user,
  inboxItems,
  activeConversation,
  activeSection = 'conversations',
  reportItems = [],
  reportCursor = null,
  reportHasMore = false,
}: MessagesPageViewProps) {
  const { t } = useLocale();
  const showReports = activeSection === 'reports';

  return (
    <div className="flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col lg:h-[calc(100vh-1rem)]">
      <div className="border-b border-gray-200 px-4 py-4 lg:px-6">
        <h1 className="text-xl font-bold text-primary-dark">{t('dashboard.messages')}</h1>
        <p className="text-sm text-gray-500">
          {showReports ? t('dashboard.messages.reportsHint') : t('dashboard.messages.hint')}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/dashboard/messages"
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !showReports ? 'bg-brand-muted text-brand-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {t('dashboard.messages.conversationsTab')}
          </Link>
          <Link
            href="/dashboard/messages/reports"
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              showReports ? 'bg-brand-muted text-brand-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {t('dashboard.messages.reportsTab')}
          </Link>
        </div>
      </div>

      {showReports ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MyConversationReportsList
            initialItems={reportItems}
            initialCursor={reportCursor}
            initialHasMore={reportHasMore}
          />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-gray-200 lg:border-b-0 lg:border-e">
            {inboxItems.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">{t('dashboard.messages.empty')}</p>
            ) : (
              <MessagesInboxPanel items={inboxItems} activeId={activeConversation?.id} />
            )}
          </aside>

          <section className="min-h-[50vh] lg:min-h-0">
            {activeConversation ? (
              <ChatWindow conversation={activeConversation} user={user} />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
                {t('dashboard.messages.emptyChat')}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
