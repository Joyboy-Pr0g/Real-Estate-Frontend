import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import {
  subFeatureBodySchema,
  subFeaturesSearchSchema,
} from '@/features/admin/schemas/features-schemas';

export async function GET(request: NextRequest) {
  const parsed = subFeaturesSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.main_feature_id) params.main_feature_id = parsed.data.main_feature_id;

  return proxyToBackend(request, {
    path: backendPaths.features.adminSub,
    method: 'GET',
    searchParams: params,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subFeatureBodySchema.safeParse(body);
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
      { path: backendPaths.features.adminSub, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
