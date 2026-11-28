import { notFound } from 'next/navigation';
import { getConversation, getConversations } from '@/features/messaging/services/messaging-service';
import { MessagesPageView } from '@/features/messaging/components/MessagesPageView';
import { getSession } from '@/lib/auth/session';

interface MessagesConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function MessagesConversationPage({ params }: MessagesConversationPageProps) {
  const { conversationId } = await params;
  const user = await getSession();
  const [inbox, conversation] = await Promise.all([
    getConversations({ limit: '30' }),
    getConversation(conversationId),
  ]);

  if (!conversation) notFound();

  return (
    <MessagesPageView
      user={user!}
      inboxItems={inbox.items}
      activeConversation={conversation}
    />
  );
}
