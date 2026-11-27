import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateUsersMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest) {
  return proxyMarketplaceMutation(
    request,
    { path: backendPaths.auth.usersBulk, method: 'DELETE' },
    revalidateUsersMarketplace,
  );
}
