import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ officeId: string }> },
) {
  const { officeId } = await params;
  const period = request.nextUrl.searchParams.get('period') ?? undefined;
  const cityId = request.nextUrl.searchParams.get('city_id') ?? undefined;
  const searchParams: Record<string, string> = {};
  if (period) searchParams.period = period;
  if (cityId) searchParams.city_id = cityId;

  return proxyToBackend(request, {
    path: backendPaths.listings.officeAnalytics(officeId),
    method: 'GET',
    searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
  });
}
