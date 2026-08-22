import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyToBackend(_request, {
    path: backendPaths.auth.userById(userId),
    method: 'DELETE',
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyToBackend(_request, {
    path: backendPaths.auth.userById(userId),
    method: 'GET',
  });
}
