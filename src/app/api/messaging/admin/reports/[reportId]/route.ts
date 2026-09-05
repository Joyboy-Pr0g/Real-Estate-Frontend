import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  return proxyToBackend(request, {
    path: backendPaths.messaging.admin.reportById(reportId),
    method: 'PATCH',
  });
}
