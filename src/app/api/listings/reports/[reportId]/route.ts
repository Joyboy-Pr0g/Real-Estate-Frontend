import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateAllListingsMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  return proxyMarketplaceMutation(
    request,
    {
      path: backendPaths.listings.reportById(reportId),
      method: 'PATCH',
    },
    revalidateAllListingsMarketplace,
  );
}
