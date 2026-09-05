import { getMyNotifications } from '@/features/notifications/services/notification-service';
import { NotificationsPanel } from '@/features/notifications/components/NotificationsPanel';

interface NotificationsContentProps {
  audience: 'dashboard' | 'admin';
}

export async function NotificationsContent({ audience }: NotificationsContentProps) {
  const initial = await getMyNotifications({ limit: '50' });
  return <NotificationsPanel audience={audience} initial={initial} />;
}
