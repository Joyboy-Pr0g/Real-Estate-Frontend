'use client';

import { useEffect, useState } from 'react';
import { getAdminNavBadges, AdminNavBadges } from '@/features/admin/services/admin-nav-badges-client';

const EMPTY: AdminNavBadges = {
  pending_offices: 0,
  pending_individual_listers: 0,
  total_listing_reports: 0,
  pending_listing_reports: 0,
};

export function useAdminNavBadges(enabled = true) {
  const [badges, setBadges] = useState<AdminNavBadges>(EMPTY);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getAdminNavBadges();
        if (!cancelled) setBadges(data);
      } catch {
        if (!cancelled) setBadges(EMPTY);
      }
    };

    void load();
    const interval = setInterval(load, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return badges;
}
