'use client';

import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';

export interface AdminNavBadges {
  pending_offices: number;
  pending_individual_listers: number;
  total_listing_reports: number;
  pending_listing_reports: number;
  total_conversation_reports: number;
  pending_conversation_reports: number;
  pending_contact: number;
}

const EMPTY: AdminNavBadges = {
  pending_offices: 0,
  pending_individual_listers: 0,
  total_listing_reports: 0,
  pending_listing_reports: 0,
  total_conversation_reports: 0,
  pending_conversation_reports: 0,
  pending_contact: 0,
};

export async function getAdminNavBadges(): Promise<AdminNavBadges> {
  const res = await clientFetch<AdminNavBadges>(bffPaths.admin.navBadges);
  return res.data ?? EMPTY;
}
