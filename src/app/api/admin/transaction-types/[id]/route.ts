import { NextRequest, NextResponse } from 'next/server';
import { proxyCatalogMutation } from '@/lib/api/catalog-mutation-route';
import { backendPaths } from '@/lib/api/endpoints';
import { transactionTypeUpdateBodySchema } from '@/features/admin/schemas/catalog-schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = transactionTypeUpdateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyCatalogMutation(
      new NextRequest(request.url, {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.transactionTypes.adminById(id), method: 'PUT' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyCatalogMutation(request, {
    path: backendPaths.transactionTypes.adminById(id),
    method: 'DELETE',
  });
}
