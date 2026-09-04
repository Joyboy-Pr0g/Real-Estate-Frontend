import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ officeId: string }> },
) {
  const { officeId } = await params;
  const period = request.nextUrl.searchParams.get('period') ?? undefined;
  return proxyToBackend(request, {
    path: backendPaths.listings.officeUserAnalytics(officeId),
    method: 'GET',
    searchParams: period ? { period } : undefined,
  });
}
