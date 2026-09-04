import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  return proxyToBackend(request, {
    path: backendPaths.offices.publicByName(decodeURIComponent(name)),
    method: 'GET',
    requireAuth: false,
  });
}
