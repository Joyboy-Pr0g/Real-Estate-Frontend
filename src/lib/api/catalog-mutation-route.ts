import { NextRequest, NextResponse } from 'next/server';
import { revalidatePublicCatalog } from '@/lib/marketplace/revalidate';
import { proxyToBackend } from '@/lib/api/route-handler';
import { withMutationRevalidate } from '@/lib/api/with-mutation-revalidate';

interface CatalogMutationProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
}

export async function proxyCatalogMutation(
  request: NextRequest,
  options: CatalogMutationProxyOptions,
): Promise<NextResponse> {
  const response = await proxyToBackend(request, options);
  const method = (options.method ?? request.method).toUpperCase();
  if (method === 'GET') {
    return response;
  }
  return withMutationRevalidate(response, revalidatePublicCatalog);
}
