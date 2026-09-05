export type OfficeVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type OfficeUserRole = 'office_admin' | 'office_agent' | 'office_manager';

export interface MyOfficeUserMembership {
  id: string;
  user_id: string;
  role: OfficeUserRole;
}

export interface MyOffice {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  office_photo_url: string;
  verification_status: OfficeVerificationStatus;
  rejected_reason: string | null;
  city: { id: string; name: string };
  neighborhood: { id: string; name: string };
  office_users: MyOfficeUserMembership[];
}

export interface OfficeUserMember {
  id: string;
  user_id: string;
  role: OfficeUserRole;
  user: {
    id: string;
    f_name: string;
    l_name: string;
    email: string;
    phone_number: string;
    user_photo?: { url: string } | null;
  };
}

export type OfficeSubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface OfficeDetail {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  verification_status: OfficeVerificationStatus;
  subscription_status: OfficeSubscriptionStatus;
  rejected_reason: string | null;
  city: { id: string; name: string };
  neighborhood: { id: string; name: string };
  office_photo: { url: string };
  documents?: {
    id: { url: string };
    office_license: { url: string };
    commercial_license: { url: string };
  };
  office_users: OfficeUserMember[];
  created_at: string;
  deleted_at: string | null;
}

export interface OfficeAnalyticsActionSummary {
  count: number;
  total_price: number;
}

export interface OfficeAnalyticsMonthlyPoint {
  month: string;
  sold: number;
  rented: number;
  sold_price: number;
  rented_price: number;
  sold_percentage: number;
  rented_percentage: number;
  sold_price_percentage: number;
  rented_price_percentage: number;
}

export interface OfficeAnalyticsTopListing {
  listing_id: string;
  title: string;
  slug: string;
  action: 'sold' | 'rented';
  price: number;
  started_at: string;
}

export type OfficeAnalyticsPeriod =
  | 'this_month'
  | 'last_three_months'
  | 'last_six_months'
  | 'last_year'
  | 'last_two_years';

export interface OfficeListingAnalytics {
  sold: OfficeAnalyticsActionSummary;
  rented: OfficeAnalyticsActionSummary;
  sold_percentage: number;
  rented_percentage: number;
  sold_price_percentage: number;
  rented_price_percentage: number;
  monthly: OfficeAnalyticsMonthlyPoint[];
  top_listings: OfficeAnalyticsTopListing[];
  period: OfficeAnalyticsPeriod;
  city_id: string | null;
}

export interface OfficeUserAnalyticsEntry {
  user_id: string;
  f_name: string;
  l_name: string;
  email: string;
  sold_count: number;
  rented_count: number;
  total_count: number;
}

export interface OfficeUserAnalytics {
  users: OfficeUserAnalyticsEntry[];
  period: OfficeAnalyticsPeriod;
}

export interface AdminOfficesFilters {
  verificationStatus?: OfficeVerificationStatus;
  search?: string;
  include_deleted?: boolean;
  cursor?: string;
  limit?: number;
}

export interface AdminOfficesPage {
  items: OfficeDetail[];
  next_cursor: string | null;
  has_more: boolean;
}
