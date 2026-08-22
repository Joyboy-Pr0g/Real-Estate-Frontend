import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { propertyTypeBodySchema, propertyTypesSearchSchema } from '@/features/admin/schemas/catalog-schemas';

export async function GET(request: NextRequest) {
  const parsed = propertyTypesSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.status) params.status = parsed.data.status;
  if (parsed.data.search) params.search = parsed.data.search;

  return proxyToBackend(request, {
    path: backendPaths.propertyTypes.admin,
    method: 'GET',
    searchParams: params,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = propertyTypeBodySchema.safeParse(body);
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
      { path: backendPaths.propertyTypes.admin, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
