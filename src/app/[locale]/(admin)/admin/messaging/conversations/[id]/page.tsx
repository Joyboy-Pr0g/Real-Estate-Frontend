import { notFound } from 'next/navigation';
import { AdminMessagesPageView } from '@/features/admin/components/messaging/AdminMessagesPageView';
import { getAdminBlocks, getAdminConversation, getAdminConversations } from '@/features/messaging/services/messaging-service';

interface AdminConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminConversationDetailPage({ params }: AdminConversationDetailPageProps) {
  const { id } = await params;
  const [inbox, conversation, blocks] = await Promise.all([
    getAdminConversations({ limit: '50' }),
    getAdminConversation(id),
    getAdminBlocks(id),
  ]);

  if (!conversation) notFound();

  return (
    <div className="p-4 lg:p-6">
      <AdminMessagesPageView
        initialItems={inbox.items}
        activeConversation={conversation}
        blocks={blocks}
      />
    </div>
  );
}
