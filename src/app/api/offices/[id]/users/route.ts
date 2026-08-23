import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, {
    path: backendPaths.offices.addUser(id),
    method: 'POST',
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, {
    path: backendPaths.offices.removeUsers(id),
    method: 'DELETE',
  });
}
