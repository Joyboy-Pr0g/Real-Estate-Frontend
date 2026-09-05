import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, { path: backendPaths.notifications.markAllRead, method: 'PATCH' });
}
