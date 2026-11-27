import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateUsersMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyMarketplaceMutation(
    request,
    {
      path: backendPaths.auth.softDeleteUser(userId),
      method: 'POST',
    },
    revalidateUsersMarketplace,
  );
}
