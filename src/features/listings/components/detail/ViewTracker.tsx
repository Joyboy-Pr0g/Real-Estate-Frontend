'use client';

import { useEffect } from 'react';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';
import { useListingViewer } from '@/features/listings/components/detail/ListingViewerProvider';

interface ViewTrackerProps {
  listingId: string;
}

export function ViewTracker({ listingId }: ViewTrackerProps) {
  const { isAuthenticated } = useListingViewer();
  useEffect(() => {
    if (!isAuthenticated) return;
    clientFetch(bffPaths.listings.view(listingId), { method: 'POST' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, isAuthenticated]);

  return null;
}
