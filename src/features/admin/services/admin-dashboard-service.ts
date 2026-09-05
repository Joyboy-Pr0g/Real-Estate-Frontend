import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';

export interface AdminDashboardSummary {
  pending_offices: number;
  pending_individual_listers: number;
  total_users: number;
  total_offices: number;
  verified_offices: number;
  total_listings: number;
  published_listings: number;
  total_individual_listers: number;
  verified_individual_listers: number;
}

export interface AdminDashboardCityStat {
  city_id: string;
  city_name: string;
  listing_count: number;
}

export interface AdminDashboardOfficeStat {
  office_id: string;
  office_name: string;
  listing_count: number;
  view_count: number;
  save_count: number;
}

export interface AdminDashboardListingStat {
  id: string;
  title: string;
  slug: string;
  city_name: string;
  view_count?: number;
  save_count?: number;
}

export interface AdminDashboardAnalytics {
  summary: AdminDashboardSummary;
  listings_by_city: AdminDashboardCityStat[];
  top_offices: AdminDashboardOfficeStat[];
  top_viewed_listings: AdminDashboardListingStat[];
  top_saved_listings: AdminDashboardListingStat[];
}

export interface AdminNavBadges {
  pending_offices: number;
  pending_individual_listers: number;
  total_listing_reports: number;
  pending_listing_reports: number;
  total_conversation_reports: number;
  pending_conversation_reports: number;
}

export async function getAdminNavBadges(): Promise<AdminNavBadges> {
  const token = await getAuthToken();
  if (!token) {
    return {
      pending_offices: 0,
      pending_individual_listers: 0,
      total_listing_reports: 0,
      pending_listing_reports: 0,
      total_conversation_reports: 0,
      pending_conversation_reports: 0,
    };
  }

  try {
    const response = await serverFetch<AdminNavBadges>(backendPaths.auth.navBadges, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? {
      pending_offices: 0,
      pending_individual_listers: 0,
      total_listing_reports: 0,
      pending_listing_reports: 0,
      total_conversation_reports: 0,
      pending_conversation_reports: 0,
    };
  } catch {
    return {
      pending_offices: 0,
      pending_individual_listers: 0,
      total_listing_reports: 0,
      pending_listing_reports: 0,
      total_conversation_reports: 0,
      pending_conversation_reports: 0,
    };
  }
}

export async function getAdminDashboard(): Promise<AdminDashboardAnalytics | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await serverFetch<AdminDashboardAnalytics>(backendPaths.auth.dashboard, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
