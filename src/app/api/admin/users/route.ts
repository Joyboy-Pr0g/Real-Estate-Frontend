import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { AdminCreateUserSchema, adminUserSearchSchema } from '@/features/auth/schemas/auth-schemas';

export async function GET(request: NextRequest) {
  const parsed = adminUserSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.role) params.role = parsed.data.role;
  if (parsed.data.status) params.status = parsed.data.status;
  if (parsed.data.search) params.search = parsed.data.search;
  if (parsed.data.cursor) params.cursor = parsed.data.cursor;
  if (parsed.data.limit) params.limit = String(parsed.data.limit);
  if (parsed.data.include_deleted) params.include_deleted = 'true';

  return proxyToBackend(request, {
    path: backendPaths.auth.users,
    method: 'GET',
    searchParams: params,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AdminCreateUserSchema.safeParse(body);
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
      { path: backendPaths.auth.users, method: 'POST' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
