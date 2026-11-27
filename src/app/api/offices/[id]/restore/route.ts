import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateOfficesMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyMarketplaceMutation(
    request,
    {
      path: backendPaths.offices.restore(id),
      method: 'PATCH',
    },
    revalidateOfficesMarketplace,
  );
}
