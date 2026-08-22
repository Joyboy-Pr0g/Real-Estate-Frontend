'use client';

import { useEffect } from 'react';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';

interface ViewTrackerProps {
  listingId: string;
  isAuthenticated: boolean;
}

export function ViewTracker({ listingId, isAuthenticated }: ViewTrackerProps) {
  useEffect(() => {
    if (!isAuthenticated) return;
    clientFetch(bffPaths.listings.view(listingId), { method: 'POST' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, isAuthenticated]);

  return null;
}
