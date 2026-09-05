import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return proxyToBackend(request, {
    path: backendPaths.messaging.admin.blocks(conversationId),
    method: 'GET',
  });
}
