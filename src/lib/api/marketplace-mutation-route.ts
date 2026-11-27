import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { withMutationRevalidate } from '@/lib/api/with-mutation-revalidate';

interface MarketplaceMutationProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
}

export async function proxyMarketplaceMutation(
  request: NextRequest,
  options: MarketplaceMutationProxyOptions,
  revalidate: () => void,
): Promise<NextResponse> {
  const response = await proxyToBackend(request, options);
  return withMutationRevalidate(response, revalidate);
}
