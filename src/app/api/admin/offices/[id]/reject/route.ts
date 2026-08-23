import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { officeRejectBodySchema } from '@/features/admin/schemas/moderation-schemas';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = officeRejectBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'PATCH',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.offices.reject(id), method: 'PATCH' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
