import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return proxyToBackend(request, {
    path: backendPaths.auth.softDeleteUser(userId),
    method: 'POST',
  });
}
