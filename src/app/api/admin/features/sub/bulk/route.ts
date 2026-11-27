import { NextRequest, NextResponse } from 'next/server';
import { proxyMarketplaceMutation } from '@/lib/api/marketplace-mutation-route';
import { revalidatePublicFeatures } from '@/lib/marketplace/revalidate';
import { backendPaths } from '@/lib/api/endpoints';
import { subFeatureBulkDeleteSchema } from '@/features/admin/schemas/features-schemas';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subFeatureBulkDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyMarketplaceMutation(
      new NextRequest(request.url, {
        method: 'DELETE',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.features.adminSubBulkDelete, method: 'DELETE' },
      revalidatePublicFeatures,
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
