import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import {
  neighborhoodBodySchema,
  neighborhoodsSearchSchema,
} from '@/features/admin/schemas/locations-schemas';

export async function GET(request: NextRequest) {
  const parsed = neighborhoodsSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.search) params.search = parsed.data.search;
  if (parsed.data.city_id) params.city_id = parsed.data.city_id;
  if (parsed.data.cursor) params.cursor = parsed.data.cursor;
  if (parsed.data.limit) params.limit = String(parsed.data.limit);

  return proxyToBackend(request, {
    path: backendPaths.neighborhoods.admin,
    method: 'GET',
    searchParams: params,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = neighborhoodBodySchema.safeParse(body);
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
      { path: backendPaths.neighborhoods.admin, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
