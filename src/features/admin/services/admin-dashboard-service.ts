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
