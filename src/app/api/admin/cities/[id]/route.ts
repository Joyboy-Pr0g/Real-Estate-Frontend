import { NextRequest } from 'next/server';
import { proxyCatalogMutation } from '@/lib/api/catalog-mutation-route';
import { backendPaths } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCatalogMutation(request, {
    path: backendPaths.cities.adminById(id),
    method: 'PUT',
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCatalogMutation(request, {
    path: backendPaths.cities.adminById(id),
    method: 'DELETE',
  });
}
