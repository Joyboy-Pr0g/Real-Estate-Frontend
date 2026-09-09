import { getConversations, getUnreadCount } from '@/features/messaging/services/messaging-service';
import { getNotificationUnreadCount } from '@/features/notifications/services/notification-service';
import { listingService } from '@/features/listings/services/listing-service';
import { getOfficeAnalytics, getOfficeDetail } from '@/features/office/services/office-service';
import { getSupportTickets } from '@/features/support-tickets/services/support-ticket-service';
import type { BuyerDashboardSnapshot, OfficeDashboardSnapshot } from '@/features/dashboard/types/dashboard-home';

export async function getBuyerDashboardSnapshot(): Promise<BuyerDashboardSnapshot> {
  const [unreadMessages, unreadNotifications] = await Promise.all([
    getUnreadCount().catch(() => 0),
    getNotificationUnreadCount(),
  ]);

  return { unreadMessages, unreadNotifications };
}

export async function getOfficeDashboardSnapshot(officeId: string): Promise<OfficeDashboardSnapshot> {
  const [
    office,
    analytics,
    publishedListings,
    conversations,
    unreadMessages,
    unreadNotifications,
    supportTickets,
  ] = await Promise.all([
    getOfficeDetail(officeId),
    getOfficeAnalytics(officeId, 'this_month'),
    listingService.getMyListings({ office_id: officeId, status: 'published', limit: 50 }),
    getConversations({ limit: '5' }),
    getUnreadCount().catch(() => 0),
    getNotificationUnreadCount(),
    getSupportTickets({ limit: '20' }),
  ]);

  const openSupportTickets = supportTickets.items.filter(
    (ticket) => ticket.status === 'pending' || ticket.status === 'in_progress',
  ).length;

  return {
    office,
    teamCount: office?.office_users.length ?? 0,
    publishedCount: publishedListings.items.length,
    publishedHasMore: publishedListings.has_more,
    soldThisMonth: analytics?.sold.count ?? 0,
    rentedThisMonth: analytics?.rented.count ?? 0,
    topListings: analytics?.top_listings.slice(0, 3) ?? [],
    conversations: conversations.items,
    unreadMessages,
    unreadNotifications,
    openSupportTickets,
  };
}
