import { NextRequest } from 'next/server';
import { proxyListingMutation } from '@/lib/api/listing-mutation-route';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyListingMutation(request, {
    path: backendPaths.listings.deleteImage(id),
    method: 'DELETE',
    listingId: id,
  });
}
