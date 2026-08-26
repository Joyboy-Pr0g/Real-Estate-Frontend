import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ entityId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { entityId } = await context.params;
  return proxyToBackend(request, {
    path: backendPaths.auth.actionLogsByEntity(entityId),
    method: 'GET',
  });
}
