import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateOfficesMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest) {
  return proxyMarketplaceMutation(
    request,
    { path: backendPaths.offices.bulk, method: 'DELETE' },
    revalidateOfficesMarketplace,
  );
}
