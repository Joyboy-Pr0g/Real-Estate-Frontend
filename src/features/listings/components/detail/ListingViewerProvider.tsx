'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { useStorefrontSession } from '@/features/storefront/providers/StorefrontSessionProvider';
import { fetchMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-client';

export interface ListingViewerState {
  isAuthenticated: boolean;
  canStartMessage: boolean;
  isSaved: boolean;
}

interface ListingViewerSeller {
  type: 'office' | 'individual';
  id: string;
}

const ListingViewerContext = createContext<ListingViewerState>({
  isAuthenticated: false,
  canStartMessage: false,
  isSaved: false,
});

async function fetchSavedListingIds(listingIds: string[]): Promise<string[]> {
  const response = await clientFetch<string[]>(bffPaths.listings.checkSaved, {
    method: 'POST',
    body: { listing_ids: listingIds },
  });
  return response.data ?? [];
}

export function ListingViewerProvider({
  listingId,
  seller,
  children,
}: {
  listingId: string;
  seller: ListingViewerSeller | null;
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useStorefrontSession();
  const needsListerProfile = isAuthenticated && user?.role !== 'office' && seller?.type === 'individual';

  const savedQuery = useQuery({
    queryKey: queryKeys.listings.savedCheck(listingId),
    queryFn: () => fetchSavedListingIds([listingId]),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const listerQuery = useQuery({
    queryKey: queryKeys.individualLister.my,
    queryFn: fetchMyIndividualListerProfile,
    enabled: needsListerProfile,
  });

  const savedListingIds = useMemo(
    () => new Set(savedQuery.data ?? []),
    [savedQuery.data],
  );

  const isSaved = savedListingIds.has(listingId);
  const listerProfileId = listerQuery.data?.id;
  const listerResolved = !needsListerProfile || listerQuery.isSuccess;
  const sellerType = seller?.type;
  const sellerId = seller?.id;

  const value = useMemo<ListingViewerState>(() => {
    const isOwnListing = sellerType === 'individual' && listerProfileId === sellerId;
    const canStartMessage =
      Boolean(user)
      && user?.role !== 'office'
      && user?.role !== 'platform_admin'
      && listerResolved
      && !isOwnListing;

    return { isAuthenticated, canStartMessage, isSaved };
  }, [isAuthenticated, isSaved, listerProfileId, listerResolved, sellerId, sellerType, user]);

  return <ListingViewerContext.Provider value={value}>{children}</ListingViewerContext.Provider>;
}

export function useListingViewer(): ListingViewerState {
  return useContext(ListingViewerContext);
}
