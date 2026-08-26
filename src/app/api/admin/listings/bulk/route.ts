import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, { path: backendPaths.listings.adminBulk, method: 'DELETE' });
}
