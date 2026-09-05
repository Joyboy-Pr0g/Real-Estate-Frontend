import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { AppNotification, CursorPage } from '@/features/notifications/types/notification';

export const NOTIFICATIONS_REFRESH_EVENT = 're:notifications-refresh';

export function dispatchNotificationsRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }
}

function unwrapList<T>(response: { data?: T[]; next_cursor?: string | null; has_more?: boolean }): CursorPage<T> {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

const noStore = { cache: 'no-store' as RequestCache };

export async function getMyNotificationsClient(params: Record<string, string> = {}): Promise<CursorPage<AppNotification>> {
  const response = await clientFetch<AppNotification[]>(bffPaths.notifications.list, {
    searchParams: params,
    ...noStore,
  });
  return unwrapList(response);
}

export async function getNotificationUnreadCountClient(): Promise<number> {
  const response = await clientFetch<{ count: number }>(bffPaths.notifications.unreadCount, noStore);
  return response.data?.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await clientFetch(bffPaths.notifications.markRead(id), { method: 'PATCH', ...noStore });
}

export async function markAllNotificationsRead(): Promise<void> {
  await clientFetch(bffPaths.notifications.markAllRead, { method: 'PATCH', ...noStore });
}

export function isNotificationUnread(notification: AppNotification): boolean {
  return notification.read_at == null;
}

export function resolveNotificationHref(
  notification: AppNotification,
  audience: 'dashboard' | 'admin',
): string | null {
  if (notification.link_path) {
    if (audience === 'admin' && notification.link_path.startsWith('/admin')) {
      return notification.link_path;
    }
    if (audience === 'dashboard' && notification.link_path.startsWith('/dashboard')) {
      return notification.link_path;
    }
    if (notification.link_path.startsWith(`/${audience === 'admin' ? 'admin' : 'dashboard'}`)) {
      return notification.link_path;
    }
  }

  if (audience === 'admin') {
    switch (notification.notification_type) {
      case 'staff_new_office_application':
      case 'staff_office_resubmitted':
        return notification.entity_id ? `/admin/offices/${notification.entity_id}` : '/admin/offices/pending';
      case 'staff_new_individual_lister_application':
      case 'staff_individual_lister_resubmitted':
        return notification.entity_id
          ? `/admin/individual-listers/${notification.entity_id}`
          : '/admin/individual-listers/pending';
      case 'staff_new_listing_report':
        return '/admin/reports';
      case 'staff_new_conversation_report':
        return '/admin/messaging/reports';
      case 'staff_new_support_ticket':
        return notification.entity_id ? `/admin/support-tickets?ticket=${notification.entity_id}` : '/admin/support-tickets';
      default:
        return null;
    }
  }

  switch (notification.notification_type) {
    case 'office_verified':
    case 'office_rejected':
    case 'office_suspended':
    case 'office_unsuspended':
      return '/dashboard/office';
    case 'individual_lister_verified':
    case 'individual_lister_unsuspended':
      return '/dashboard/listings';
    case 'individual_lister_rejected':
    case 'individual_lister_suspended':
      return '/dashboard/become-a-lister';
    case 'new_message':
      return notification.entity_id ? `/dashboard/messages/${notification.entity_id}` : '/dashboard/messages';
    case 'platform_announcement': {
      const announcementId = notification.announcement_id ?? notification.entity_id;
      return announcementId ? `/dashboard/announcements/${announcementId}` : null;
    }
    default:
      return null;
  }
}
