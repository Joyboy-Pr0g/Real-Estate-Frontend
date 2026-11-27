import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateUsersMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyMarketplaceMutation(
    _request,
    {
      path: backendPaths.auth.userById(userId),
      method: 'DELETE',
    },
    revalidateUsersMarketplace,
  );
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyToBackend(_request, {
    path: backendPaths.auth.userById(userId),
    method: 'GET',
  });
}
