import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { mainFeatureBodySchema } from '@/features/admin/schemas/features-schemas';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    path: backendPaths.features.admin,
    method: 'GET',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = mainFeatureBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.features.admin, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
