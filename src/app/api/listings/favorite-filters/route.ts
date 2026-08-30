import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: backendPaths.listings.favoriteFilters, method: 'GET' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend(
    new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body),
    }),
    { path: backendPaths.listings.favoriteFilters, method: 'POST' },
  );
}
