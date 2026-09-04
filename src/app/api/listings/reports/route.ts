import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') ?? undefined;
  const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
  const limit = request.nextUrl.searchParams.get('limit') ?? undefined;
  const searchParams: Record<string, string> = {};
  if (status) searchParams.status = status;
  if (cursor) searchParams.cursor = cursor;
  if (limit) searchParams.limit = limit;

  return proxyToBackend(request, {
    path: backendPaths.listings.reports,
    method: 'GET',
    searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
  });
}
