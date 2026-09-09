import { NextRequest, NextResponse } from 'next/server';
import { revalidateListingsMarketplace } from '@/lib/marketplace/revalidate';
import { proxyToBackend } from '@/lib/api/route-handler';
import { withMutationRevalidate } from '@/lib/api/with-mutation-revalidate';

interface ListingMutationProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
  listingId?: string;
}

export async function proxyListingMutation(
  request: NextRequest,
  options: ListingMutationProxyOptions,
): Promise<NextResponse> {
  const { listingId, ...proxyOptions } = options;
  const response = await proxyToBackend(request, proxyOptions);
  return withMutationRevalidate(response, () => revalidateListingsMarketplace(listingId));
}
