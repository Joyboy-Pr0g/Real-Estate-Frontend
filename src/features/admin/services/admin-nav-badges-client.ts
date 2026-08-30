'use client';

import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';

export interface AdminNavBadges {
  pending_offices: number;
  pending_individual_listers: number;
}

const EMPTY: AdminNavBadges = {
  pending_offices: 0,
  pending_individual_listers: 0,
};

export async function getAdminNavBadges(): Promise<AdminNavBadges> {
  const res = await clientFetch<AdminNavBadges>(bffPaths.admin.navBadges);
  return res.data ?? EMPTY;
}
