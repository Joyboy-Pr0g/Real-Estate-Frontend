import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: backendPaths.supportTickets.tickets, method: 'GET' });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, { path: backendPaths.supportTickets.tickets, method: 'POST' });
}
