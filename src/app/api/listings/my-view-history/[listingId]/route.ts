import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  return proxyToBackend(request, { path: backendPaths.listings.myViewHistoryEntry(listingId), method: 'DELETE' });
}
