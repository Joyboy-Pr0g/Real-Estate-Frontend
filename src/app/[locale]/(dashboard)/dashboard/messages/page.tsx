import { getConversations } from '@/features/messaging/services/messaging-service';
import { MessagesPageView } from '@/features/messaging/components/MessagesPageView';
import { getSession } from '@/lib/auth/session';

export default async function MessagesPage() {
  const user = await getSession();
  const inbox = await getConversations({ limit: '30' });

  return <MessagesPageView user={user!} inboxItems={inbox.items} />;
}
