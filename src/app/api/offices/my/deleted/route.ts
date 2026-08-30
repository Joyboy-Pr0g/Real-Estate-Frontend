import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.toString();
  return proxyToBackend(request, {
    path: `${backendPaths.offices.myDeleted}${query ? `?${query}` : ''}`,
    method: 'GET',
  });
}
