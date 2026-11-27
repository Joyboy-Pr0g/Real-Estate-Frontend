import { NextRequest, NextResponse } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidatePublicFeatures } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';
import { mainFeatureUpdateBodySchema } from '@/features/admin/schemas/features-schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = mainFeatureUpdateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyMarketplaceMutation(
      new NextRequest(request.url, {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.features.adminById(id), method: 'PUT' },
      revalidatePublicFeatures,
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyMarketplaceMutation(
    request,
    {
      path: backendPaths.features.adminById(id),
      method: 'DELETE',
    },
    revalidatePublicFeatures,
  );
}
