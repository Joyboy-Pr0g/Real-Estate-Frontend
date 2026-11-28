import { AdminMessagesPageView } from '@/features/admin/components/messaging/AdminMessagesPageView';
import { getAdminConversations } from '@/features/messaging/services/messaging-service';

export default async function AdminMessagingConversationsPage() {
  const conversations = await getAdminConversations({ limit: '50' });

  return (
    <div className="p-4 lg:p-6">
      <AdminMessagesPageView initialItems={conversations.items} />
    </div>
  );
}
