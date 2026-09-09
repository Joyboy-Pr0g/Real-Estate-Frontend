import type { ConversationInboxRow } from '@/features/messaging/types/messaging';
import type { OfficeAnalyticsTopListing, OfficeDetail, MyOffice } from '@/features/office/types/office';

export interface BuyerDashboardSnapshot {
  unreadMessages: number;
  unreadNotifications: number;
}

export interface OfficeDashboardSnapshot {
  office: OfficeDetail | null;
  teamCount: number;
  publishedCount: number;
  publishedHasMore: boolean;
  soldThisMonth: number;
  rentedThisMonth: number;
  topListings: OfficeAnalyticsTopListing[];
  conversations: ConversationInboxRow[];
  unreadMessages: number;
  unreadNotifications: number;
  openSupportTickets: number;
}

export interface DashboardOfficeContext {
  offices: MyOffice[];
  snapshot: OfficeDashboardSnapshot | null;
}
