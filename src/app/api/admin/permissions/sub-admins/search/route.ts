import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  return proxyToBackend(request, {
    path: backendPaths.auth.subAdminsSearch,
    method: 'GET',
    searchParams,
  });
}
