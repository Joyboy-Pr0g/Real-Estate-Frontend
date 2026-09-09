import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { proxyListingMutation } from '@/lib/api/listing-mutation-route';
import { backendPaths } from '@/lib/api/endpoints';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: backendPaths.listings.getById(id),
    method: 'GET',
    requireAuth: false,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyListingMutation(request, {
    path: backendPaths.listings.getById(id),
    method: 'PUT',
    listingId: id,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyListingMutation(request, {
    path: backendPaths.listings.getById(id),
    method: 'DELETE',
    listingId: id,
  });
}
