import { getMyConversationReports } from '@/features/messaging/services/messaging-service';
import { MessagesPageView } from '@/features/messaging/components/MessagesPageView';
import { getSession } from '@/lib/auth/session';

export default async function MessagesReportsPage() {
  const user = await getSession();
  const reports = await getMyConversationReports({ limit: '24' });

  return (
    <MessagesPageView
      user={user!}
      inboxItems={[]}
      activeSection="reports"
      reportItems={reports.items}
      reportCursor={reports.next_cursor}
      reportHasMore={reports.has_more}
    />
  );
}
