import { NextRequest } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidateIndividualListersMarketplace } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyMarketplaceMutation(
    request,
    { path: backendPaths.individualListers.delete(id), method: 'DELETE' },
    revalidateIndividualListersMarketplace,
  );
}
